// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import {ICommitmentStore} from "./ICommitmentStore.sol";

// Features we would add in the future:
// - Ability for there to be multiple stakers (i.e. mapping(address=>uint256) stakers)
//   for each commitment. Would increase complexity for slashing logic such that all stakers
//   are slashed equally.
contract CommitmentStore is ICommitmentStore {
    uint256 public constant challengePeriod = 1 hours;

    mapping(address => Commitment) public commitments;
    
    struct Commitment {
        // Slashable amount of tokens for this commitment. Can be 
        // added to after initial stake.
        uint256 stakeAmount;
        // URL to readable terms of commitment detailing slashing conditions.
        bytes commitmentTermsUrl;
        // Address where slashed funds are sent to. Ideally is a contract
        // that shares the slash profits amongst stakeholders.
        address slashRecipient;

        // Set to non-zero timestamp when staker can withdraw if they request a withdrawal.
        uint256 withdrawalTimestamp;
    }

    function makeCommitment(
        Commitment memory commitment
    ) external payable {
        if (commitment.stakeAmount == 0) revert ZeroStake();
        if (msg.value != commitment.stakeAmount) revert InsufficientMsgValue();
        commitments[msg.sender] = commitment;
    }

    function requestWithdrawStake(
        uint256 amountToWithdraw
    ) external {
        if (amountToWithdraw == 0) revert ZeroWithdrawal();

        Commitment storage commitment = commitments[msg.sender];
        if (commitment.stakeAmount == 0) revert NoCommitment();
        if (commitment.stakeAmount <= amountToWithdraw) revert InsufficentStake();
        if (commitment.withdrawalTimestamp != 0) revert WithdrawalAlreadyRequested();

        commitment.withdrawalTimestamp = block.timestamp + challengePeriod;
    }

    function finalizeWithdrawStake() external {
        Commitment storage commitment = commitments[msg.sender];
        if (block.timestamp < commitment.withdrawalTimestamp) revert WithdrawalPending();


    }

    function stakeMore(
        bytes32 identifier,
        uint256 stakeAmount
    ) external {
        // TODO
    }
}
