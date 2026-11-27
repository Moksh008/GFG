"""Client for the on-chain DermoraReportRegistry contract.

Modes (WEB3_RPC_URL):
  ""      → disabled: reports are fingerprinted and stored in the DB only.
  "local" → in-process Ethereum dev chain (eth-tester); the contract is deployed at startup.
            Great for development/demos, but it resets whenever the API restarts.
  URL     → real network (e.g. Base Sepolia). Needs WEB3_PRIVATE_KEY (issuer wallet with gas)
            and REPORT_REGISTRY_ADDRESS (see scripts/deploy_registry.py).
"""
from __future__ import annotations

import json
import logging
import threading
from dataclasses import dataclass
from pathlib import Path

from app.core.config import settings

log = logging.getLogger("dermora.chain")

ARTIFACT = json.loads((Path(__file__).parent / "DermoraReportRegistry.json").read_text(encoding="utf-8"))

KNOWN_NETWORKS = {
    1: ("Ethereum", "https://etherscan.io"),
    11155111: ("Ethereum Sepolia", "https://sepolia.etherscan.io"),
    8453: ("Base", "https://basescan.org"),
    84532: ("Base Sepolia", "https://sepolia.basescan.org"),
    137: ("Polygon", "https://polygonscan.com"),
    80002: ("Polygon Amoy", "https://amoy.polygonscan.com"),
}


class ChainError(RuntimeError):
    pass


@dataclass
class AnchorReceipt:
    tx_hash: str
    block_number: int
    already_anchored: bool = False


def to_bytes32(sha256_hex: str) -> bytes:
    h = sha256_hex.lower().removeprefix("0x")
    if len(h) != 64:
        raise ValueError("Expected a 32-byte SHA-256 hex digest")
    return bytes.fromhex(h)


class ReportRegistry:
    def __init__(self) -> None:
        self._lock = threading.RLock()  # serialises nonces; eth-tester isn't thread-safe
        self._w3 = None
        self._contract = None
        self._sender = None  # address used as `from`
        self._account = None  # LocalAccount for signing (remote mode)
        self.mode = "off"
        self.error: str | None = None
        self.chain_id: int | None = None
        self._connected = False

    # ---------------------------------------------------------------- setup
    @property
    def enabled(self) -> bool:
        return self.mode != "off" and self.error is None

    def connect(self) -> None:
        """Idempotent; safe to call from any request. Errors are recorded, not raised."""
        with self._lock:
            if self._connected:
                return
            self._connected = True
            url = settings.web3_rpc_url.strip()
            if not url:
                self.mode = "off"
                return
            try:
                from web3 import Web3

                if url == "local":
                    self._connect_local(Web3)
                else:
                    self._connect_remote(Web3, url)
                self.chain_id = self._w3.eth.chain_id
                log.info("Report registry ready (%s) at %s on chain %s", self.mode, self._contract.address, self.chain_id)
            except Exception as exc:
                self.error = f"{type(exc).__name__}: {exc}"
                log.exception("Report registry unavailable")

    def _connect_local(self, Web3) -> None:
        from web3 import EthereumTesterProvider

        self.mode = "local"
        self._w3 = Web3(EthereumTesterProvider())
        self._sender = self._w3.eth.accounts[0]
        factory = self._w3.eth.contract(abi=ARTIFACT["abi"], bytecode=ARTIFACT["bytecode"])
        receipt = self._w3.eth.wait_for_transaction_receipt(factory.constructor().transact({"from": self._sender}))
        self._contract = self._w3.eth.contract(address=receipt.contractAddress, abi=ARTIFACT["abi"])

    def _connect_remote(self, Web3, url: str) -> None:
        from eth_account import Account

        self.mode = "remote"
        if not settings.web3_private_key:
            raise ChainError("WEB3_PRIVATE_KEY is required for a remote network")
        if not settings.report_registry_address:
            raise ChainError("REPORT_REGISTRY_ADDRESS is not set — run scripts/deploy_registry.py")
        self._w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 30}))
        if not self._w3.is_connected():
            raise ChainError(f"Cannot reach RPC {url}")
        self._account = Account.from_key(settings.web3_private_key)
        self._sender = self._account.address
        self._contract = self._w3.eth.contract(
            address=Web3.to_checksum_address(settings.report_registry_address), abi=ARTIFACT["abi"]
        )
        if not self._contract.functions.isIssuer(self._sender).call():
            raise ChainError(f"Wallet {self._sender} is not an approved issuer on the registry")

    # ---------------------------------------------------------------- info
    @property
    def network_name(self) -> str:
        if settings.web3_network_name:
            return settings.web3_network_name
        if self.mode == "local":
            return "Local dev chain"
        return KNOWN_NETWORKS.get(self.chain_id, (f"Chain {self.chain_id}", ""))[0]

    @property
    def explorer_url(self) -> str:
        if settings.web3_explorer_url:
            return settings.web3_explorer_url.rstrip("/")
        return KNOWN_NETWORKS.get(self.chain_id, ("", ""))[1]

    def tx_url(self, tx_hash: str | None) -> str | None:
        return f"{self.explorer_url}/tx/{tx_hash}" if tx_hash and self.explorer_url else None

    def contract_url(self) -> str | None:
        if self._contract is None or not self.explorer_url:
            return None
        return f"{self.explorer_url}/address/{self._contract.address}"

    def status(self) -> dict:
        self.connect()
        return {
            "mode": self.mode,
            "enabled": self.enabled,
            "error": self.error,
            "network": self.network_name if self.mode != "off" else None,
            "chainId": self.chain_id,
            "contract": self._contract.address if self._contract is not None else None,
            "contractUrl": self.contract_url(),
            "issuer": self._sender,
        }

    # ---------------------------------------------------------------- calls
    def anchor(self, sha256_hex: str) -> AnchorReceipt:
        self.connect()
        if not self.enabled:
            raise ChainError(self.error or "Blockchain anchoring is disabled")
        digest = to_bytes32(sha256_hex)
        with self._lock:
            anchored, _, _ = self._contract.functions.verify(digest).call()
            if anchored:
                return AnchorReceipt(tx_hash="", block_number=0, already_anchored=True)
            fn = self._contract.functions.anchor(digest)
            if self.mode == "local":
                tx_hash = fn.transact({"from": self._sender})
            else:
                tx = fn.build_transaction({
                    "from": self._sender,
                    "nonce": self._w3.eth.get_transaction_count(self._sender, "pending"),
                    "chainId": self.chain_id,
                })
                signed = self._account.sign_transaction(tx)
                tx_hash = self._w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self._w3.eth.wait_for_transaction_receipt(tx_hash, timeout=settings.web3_confirm_timeout_seconds)
        if receipt.status != 1:
            raise ChainError(f"Anchor transaction reverted: {tx_hash.hex()}")
        return AnchorReceipt(tx_hash="0x" + tx_hash.hex().removeprefix("0x"), block_number=receipt.blockNumber)

    def verify(self, sha256_hex: str) -> dict | None:
        """Live on-chain lookup. None when the chain is disabled or unreachable."""
        self.connect()
        if not self.enabled:
            return None
        try:
            with self._lock:
                anchored, timestamp, issuer = self._contract.functions.verify(to_bytes32(sha256_hex)).call()
                trusted = bool(anchored) and self._contract.functions.isIssuer(issuer).call()
            return {"anchored": bool(anchored), "timestamp": int(timestamp), "issuer": issuer if anchored else None,
                    "issuerTrusted": trusted}
        except Exception:
            log.exception("On-chain verify failed")
            return None


registry = ReportRegistry()
