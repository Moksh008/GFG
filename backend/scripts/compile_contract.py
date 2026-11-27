"""Compile contracts/DermoraReportRegistry.sol into app/blockchain/DermoraReportRegistry.json.

The compiled artifact (ABI + bytecode) is committed, so the API never needs a Solidity
compiler at runtime. Re-run this only after editing the contract:

    python scripts/compile_contract.py
"""
from __future__ import annotations

import json
from pathlib import Path

import solcx

SOLC_VERSION = "0.8.24"
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "contracts" / "DermoraReportRegistry.sol"
ARTIFACT = ROOT / "app" / "blockchain" / "DermoraReportRegistry.json"


def main() -> None:
    if SOLC_VERSION not in {str(v) for v in solcx.get_installed_solc_versions()}:
        print(f"Installing solc {SOLC_VERSION}…")
        solcx.install_solc(SOLC_VERSION)
    out = solcx.compile_standard(
        {
            "language": "Solidity",
            "sources": {SOURCE.name: {"content": SOURCE.read_text(encoding="utf-8")}},
            "settings": {
                "optimizer": {"enabled": True, "runs": 200},
                # 'paris' avoids PUSH0 so the bytecode also runs on chains/EVMs without Shanghai.
                "evmVersion": "paris",
                "outputSelection": {"*": {"*": ["abi", "evm.bytecode.object"]}},
            },
        },
        solc_version=SOLC_VERSION,
    )
    contract = out["contracts"][SOURCE.name]["DermoraReportRegistry"]
    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    ARTIFACT.write_text(
        json.dumps(
            {
                "contractName": "DermoraReportRegistry",
                "compiler": f"solc {SOLC_VERSION}",
                "abi": contract["abi"],
                "bytecode": "0x" + contract["evm"]["bytecode"]["object"],
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Wrote {ARTIFACT.relative_to(ROOT)} ({len(contract['evm']['bytecode']['object']) // 2} bytes of bytecode)")


if __name__ == "__main__":
    main()
