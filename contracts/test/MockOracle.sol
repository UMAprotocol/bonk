pragma solidity ^0.8.0;

import "../src/CommitmentStore.sol";

contract MockOracle is OptimisticOracleV3Interface {
    event AssertedTruth(address indexed caller);
    event DisputedAssertion(address indexed caller);

    function assertTruth(
        bytes memory claim,
        address asserter,
        address callbackRecipient,
        address escalationManager,
        uint64 liveness,
        IERC20 currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domainId
    )
        external
        returns (bytes32)
    {
        emit AssertedTruth(msg.sender);
        return keccak256(abi.encodePacked(msg.sender));
    }

    function disputeAssertion(bytes32 assertionId, address disputer) external {
        emit DisputedAssertion(msg.sender);
    }
}
