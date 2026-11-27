// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Dermora Report Registry
/// @notice Anchors SHA-256 fingerprints of doctor-ready PDF reports issued by Dermora so that
///         anyone can verify a report is authentic and unaltered. Only hashes are stored —
///         never patient data. Each report embeds a random ID, so hashes cannot be guessed.
contract DermoraReportRegistry {
    struct Anchor {
        uint64 timestamp; // block timestamp when anchored (0 = never)
        address issuer;   // Dermora issuer wallet that anchored it
    }

    address public owner;
    mapping(address => bool) public isIssuer;
    mapping(bytes32 => Anchor) private anchors;
    uint256 public totalAnchored;

    event ReportAnchored(bytes32 indexed reportHash, address indexed issuer, uint64 timestamp);
    event IssuerUpdated(address indexed issuer, bool allowed);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error NotIssuer();
    error AlreadyAnchored(bytes32 reportHash);
    error ZeroHash();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyIssuer() {
        if (!isIssuer[msg.sender]) revert NotIssuer();
        _;
    }

    constructor() {
        owner = msg.sender;
        isIssuer[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
        emit IssuerUpdated(msg.sender, true);
    }

    /// @notice Record a report fingerprint. Reverts if it was already anchored, so the
    ///         original issuance time can never be overwritten.
    function anchor(bytes32 reportHash) external onlyIssuer {
        if (reportHash == bytes32(0)) revert ZeroHash();
        if (anchors[reportHash].timestamp != 0) revert AlreadyAnchored(reportHash);
        uint64 ts = uint64(block.timestamp);
        anchors[reportHash] = Anchor(ts, msg.sender);
        unchecked {
            totalAnchored++;
        }
        emit ReportAnchored(reportHash, msg.sender, ts);
    }

    /// @notice Check a fingerprint. Free to call (view).
    function verify(bytes32 reportHash) external view returns (bool anchored, uint64 timestamp, address issuer) {
        Anchor memory a = anchors[reportHash];
        return (a.timestamp != 0, a.timestamp, a.issuer);
    }

    function setIssuer(address issuer, bool allowed) external onlyOwner {
        if (issuer == address(0)) revert ZeroAddress();
        isIssuer[issuer] = allowed;
        emit IssuerUpdated(issuer, allowed);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
