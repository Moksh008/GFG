"""Contract rules + the issue -> anchor -> public verify flow on an in-process chain."""
import ast
import hashlib
import re
import time

import pytest
from web3 import EthereumTesterProvider, Web3

from app.blockchain.registry import ARTIFACT


# ------------------------------------------------------------------ contract
@pytest.fixture()
def chain():
    w3 = Web3(EthereumTesterProvider())
    owner, issuer, stranger = w3.eth.accounts[:3]
    factory = w3.eth.contract(abi=ARTIFACT["abi"], bytecode=ARTIFACT["bytecode"])
    addr = w3.eth.wait_for_transaction_receipt(factory.constructor().transact({"from": owner})).contractAddress
    return w3, w3.eth.contract(address=addr, abi=ARTIFACT["abi"]), owner, issuer, stranger


def h(text: str) -> bytes:
    return hashlib.sha256(text.encode()).digest()


def revert_data(exc: Exception) -> bytes:
    arg = exc.args[0] if exc.args else b""
    if isinstance(arg, bytes):
        return arg
    match = re.search(r"b(['\"]).*\1", str(arg))
    return ast.literal_eval(match.group(0)) if match else b""


def assert_reverts(fn, error_signature: str) -> None:
    """The call must revert with this exact custom error, e.g. 'NotIssuer()'."""
    with pytest.raises(Exception) as info:
        fn()
    assert revert_data(info.value)[:4] == Web3.keccak(text=error_signature)[:4], info.value


def test_contract_anchor_and_verify(chain):
    w3, c, owner, *_ = chain
    assert c.functions.verify(h("report")).call()[0] is False
    w3.eth.wait_for_transaction_receipt(c.functions.anchor(h("report")).transact({"from": owner}))
    anchored, ts, issuer = c.functions.verify(h("report")).call()
    assert anchored and ts > 0 and issuer == owner
    assert c.functions.totalAnchored().call() == 1


def test_contract_rejects_duplicates_zero_and_strangers(chain):
    w3, c, owner, _, stranger = chain
    c.functions.anchor(h("x")).transact({"from": owner})
    # The original issuance time can never be overwritten.
    assert_reverts(lambda: c.functions.anchor(h("x")).transact({"from": owner}), "AlreadyAnchored(bytes32)")
    assert_reverts(lambda: c.functions.anchor(b"\x00" * 32).transact({"from": owner}), "ZeroHash()")
    assert_reverts(lambda: c.functions.anchor(h("y")).transact({"from": stranger}), "NotIssuer()")


def test_contract_issuer_management(chain):
    w3, c, owner, issuer, stranger = chain
    assert_reverts(lambda: c.functions.setIssuer(stranger, True).transact({"from": stranger}), "NotOwner()")
    c.functions.setIssuer(issuer, True).transact({"from": owner})
    c.functions.anchor(h("by-issuer")).transact({"from": issuer})
    assert c.functions.verify(h("by-issuer")).call()[2] == issuer
    c.functions.setIssuer(issuer, False).transact({"from": owner})
    assert_reverts(lambda: c.functions.anchor(h("later")).transact({"from": issuer}), "NotIssuer()")


# ------------------------------------------------------------------ API flow
def wait_anchored(client, headers, report_id, timeout=20):
    deadline = time.time() + timeout
    while time.time() < deadline:
        reports = client.get("/reports/issued", headers=headers).json()["reports"]
        rec = next(r for r in reports if r["id"] == report_id)
        if rec["chain"]["status"] in ("anchored", "failed"):
            return rec
        time.sleep(0.2)
    raise AssertionError("report was not anchored in time")


def test_report_issued_anchored_and_publicly_verifiable(client, demo_auth):
    r = client.get("/reports/pdf", headers=demo_auth)
    assert r.status_code == 200 and r.content.startswith(b"%PDF")
    report_id, sha = r.headers["X-Report-Id"], r.headers["X-Report-Sha256"]
    assert hashlib.sha256(r.content).hexdigest() == sha  # header matches the bytes delivered

    rec = wait_anchored(client, demo_auth, report_id)
    assert rec["chain"]["status"] == "anchored", rec["chain"]["error"]
    assert rec["chain"]["txHash"].startswith("0x") and rec["chain"]["blockNumber"] > 0
    assert rec["verifyUrl"] == f"http://dermora.test/verify/{report_id}"

    # Public: no Authorization header
    v = client.get("/reports/verify", params={"hash": sha}).json()
    assert v["verdict"] == "verified"
    assert v["onChain"]["anchored"] and v["onChain"]["issuerTrusted"]
    assert v["report"]["id"] == report_id and v["report"]["issuedTo"] == "A. M."
    assert "email" not in str(v).lower()  # no patient contact details exposed

    by_id = client.get(f"/reports/verify/{report_id}").json()
    assert by_id["verdict"] == "verified" and by_id["sha256"] == sha


def test_tampered_report_fails_verification(client, demo_auth):
    pdf = client.get("/reports/pdf", headers=demo_auth).content
    # Flip one byte mid-file. (PDF text streams are compressed, so a visible-text
    # substitution wouldn't change the bytes at all.)
    mid = len(pdf) // 2
    tampered = pdf[:mid] + bytes([pdf[mid] ^ 0x01]) + pdf[mid + 1:]
    assert tampered != pdf
    v = client.get("/reports/verify", params={"hash": hashlib.sha256(tampered).hexdigest()}).json()
    assert v["verdict"] == "not_found" and v["report"] is None


def test_verify_input_validation(client):
    assert client.get("/reports/verify", params={"hash": "abc"}).status_code == 422
    assert client.get("/reports/verify/does-not-exist").status_code == 404


def test_health_reports_chain(client):
    chain = client.get("/health").json()["blockchain"]
    assert chain["mode"] == "local" and chain["enabled"] and chain["contract"].startswith("0x")
