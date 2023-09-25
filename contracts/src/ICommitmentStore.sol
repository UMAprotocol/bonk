// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

contract ICommitmentStore {
    error ZeroStake();
    error InsufficientMsgValue();
    error NoCommitment();
    error InsufficentStake();
    error AlreadyRequested();
    error Pending();
    error PassedLiveness();
    error ActiveBonk();
    error NonZeroStake();
    error SlashDoesNotExist();
}
