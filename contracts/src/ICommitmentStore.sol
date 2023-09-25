// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

contract ICommitmentStore {
    error ZeroStake();
    error InsufficientMsgValue();
    error ZeroWithdrawal();
    error NoCommitment();
    error InsufficentStake();
    error WithdrawalAlreadyRequested();
    error WithdrawalPending();
}
