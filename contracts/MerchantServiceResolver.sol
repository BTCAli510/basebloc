// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { SchemaResolver } from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import { IEAS, Attestation } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

contract MerchantServiceResolver is SchemaResolver {
    address public owner;
    address public authorizedAttester;
    mapping(bytes32 => address) public merchantRegistry;
    mapping(bytes32 => bool) public merchantConfirmed;

    constructor(IEAS eas, address _attester) SchemaResolver(eas) {
        owner = msg.sender;
        authorizedAttester = _attester;
    }

    function onAttest(Attestation calldata attestation, uint256) internal override returns (bool) {
        return attestation.attester == authorizedAttester;
    }

    function confirmService(bytes32 attestationUID, bytes32 merchantId) external {
        require(merchantRegistry[merchantId] == msg.sender, "Not authorized merchant");
        require(!merchantConfirmed[attestationUID], "Already confirmed");
        merchantConfirmed[attestationUID] = true;
    }

    function onRevoke(Attestation calldata, uint256) internal override returns (bool) {
        return true;
    }

    function registerMerchant(bytes32 merchantId, address wallet) external {
        require(msg.sender == owner, "Not owner");
        merchantRegistry[merchantId] = wallet;
    }

    function updateAttester(address newAttester) external {
        require(msg.sender == owner, "Not owner");
        authorizedAttester = newAttester;
    }
}
