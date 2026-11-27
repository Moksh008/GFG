"""Deploy DermoraReportRegistry to a real network (e.g. Base Sepolia).

    # 1. Create an issuer wallet (saved to backend/.env) and fund it from a faucet
    python scripts/deploy_registry.py wallet

    # 2. Check the balance, then deploy and write REPORT_REGISTRY_ADDRESS to .env
    python scripts/deploy_registry.py balance
    python scripts/deploy_registry.py deploy

The RPC defaults to WEB3_RPC_URL from .env, or Base Sepolia's public endpoint.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from eth_account import Account  # noqa: E402
from web3 import Web3  # noqa: E402

from app.core.config import settings  # noqa: E402

ENV = ROOT / ".env"
ARTIFACT = json.loads((ROOT / "app" / "blockchain" / "DermoraReportRegistry.json").read_text(encoding="utf-8"))
DEFAULT_RPC = "https://sepolia.base.org"
FAUCETS = {
    84532: "https://docs.base.org/base-chain/tools/network-faucets",
    80002: "https://faucet.polygon.technology",
    11155111: "https://sepoliafaucet.com",
}


def set_env(key: str, value: str) -> None:
    """Insert or replace KEY=value in backend/.env without touching other lines."""
    text = ENV.read_text(encoding="utf-8") if ENV.exists() else ""
    line = f"{key}={value}"
    pattern = re.compile(rf"^#?\s*{re.escape(key)}=.*$", re.M)
    text = pattern.sub(line, text, count=1) if pattern.search(text) else text.rstrip("\n") + f"\n{line}\n"
    ENV.write_text(text, encoding="utf-8")


def rpc_url(arg: str | None) -> str:
    url = arg or settings.web3_rpc_url
    return DEFAULT_RPC if not url or url == "local" else url


def connect(url: str) -> Web3:
    w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 30}))
    if not w3.is_connected():
        sys.exit(f"Cannot reach RPC {url}")
    return w3


def cmd_wallet(args) -> None:
    if settings.web3_private_key and not args.force:
        addr = Account.from_key(settings.web3_private_key).address
        print(f"An issuer wallet already exists in .env: {addr}\n(use --force to replace it)")
        return
    acct = Account.create()
    set_env("WEB3_PRIVATE_KEY", acct.key.hex())
    print(f"New issuer wallet saved to backend/.env\n  Address: {acct.address}")
    print("Fund it with testnet ETH, e.g. Base Sepolia faucet:", FAUCETS[84532])


def cmd_balance(args) -> None:
    w3 = connect(rpc_url(args.rpc))
    addr = Account.from_key(settings.web3_private_key).address
    bal = w3.eth.get_balance(addr)
    print(f"Chain {w3.eth.chain_id}  {addr}  balance: {Web3.from_wei(bal, 'ether')} ETH")


def cmd_deploy(args) -> None:
    if not settings.web3_private_key:
        sys.exit("No WEB3_PRIVATE_KEY in .env — run: python scripts/deploy_registry.py wallet")
    url = rpc_url(args.rpc)
    w3 = connect(url)
    acct = Account.from_key(settings.web3_private_key)
    chain_id = w3.eth.chain_id
    balance = w3.eth.get_balance(acct.address)
    print(f"Deploying from {acct.address} on chain {chain_id} (balance {Web3.from_wei(balance, 'ether')} ETH)…")
    if balance == 0:
        sys.exit(f"Wallet has no gas. Fund it first: {FAUCETS.get(chain_id, 'a faucet for this network')}")
    factory = w3.eth.contract(abi=ARTIFACT["abi"], bytecode=ARTIFACT["bytecode"])
    tx = factory.constructor().build_transaction({
        "from": acct.address,
        "nonce": w3.eth.get_transaction_count(acct.address, "pending"),
        "chainId": chain_id,
    })
    tx_hash = w3.eth.send_raw_transaction(acct.sign_transaction(tx).raw_transaction)
    print(f"  tx {tx_hash.hex()} — waiting for confirmation…")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
    if receipt.status != 1:
        sys.exit("Deployment reverted")
    set_env("WEB3_RPC_URL", url)
    set_env("REPORT_REGISTRY_ADDRESS", receipt.contractAddress)
    print(f"Deployed DermoraReportRegistry at {receipt.contractAddress} (block {receipt.blockNumber})")
    print("Saved WEB3_RPC_URL and REPORT_REGISTRY_ADDRESS to backend/.env — restart the API.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    w = sub.add_parser("wallet", help="create an issuer wallet in .env")
    w.add_argument("--force", action="store_true")
    for name in ("balance", "deploy"):
        p = sub.add_parser(name)
        p.add_argument("--rpc", help=f"RPC URL (default: WEB3_RPC_URL or {DEFAULT_RPC})")
    args = parser.parse_args()
    {"wallet": cmd_wallet, "balance": cmd_balance, "deploy": cmd_deploy}[args.cmd](args)


if __name__ == "__main__":
    main()
