// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract ICommitmentStore {
    error NotStaker();
    error ZeroStake();
    error NoCommitment();
    error InsufficentStake();
    error InvalidSlashAmount();
    error AlreadyRequested();
    error Pending();
    error PassedLiveness();
    error ActiveBonk();
    error NonZeroStake();
    error SlashDoesNotExist();

    event NewCommitment(
        bytes32 indexed stakerId, address indexed staker, uint256 stakeAmount, bytes32 indexed commitmentTerms
    );
    event BonkAttempt(
        bytes32 indexed stakerId,
        address indexed staker,
        address indexed bonker,
        uint256 slashAmount,
        address slashRecipient,
        bytes32 details
    );
    event BonkDenied(bytes32 indexed stakerId, address indexed staker, address indexed bonker, address denier);
    event BonkSucceeded(bytes32 indexed stakerId, address indexed staker, address indexed bonker);
    event RequestCommitmentWithdrawal(bytes32 indexed stakerId, address indexed staker, uint256 finalizationTimestamp);
    event FinalizedCommitmentWithdrawal(bytes32 indexed stakerId, address indexed staker);

    // A commitment represents an economic stake that can be slashed if the terms of the agreement, as referenced by the
    // the commitmentTermsIdentifier are violated.
    struct Commitment {
        // Address who made commitment and deposited stake, and only address who can withdraw stake.
        address staker;
        // Token to stake.
        IERC20 stakeToken;
        // Slashable amount of tokens for this commitment. Can be
        // added to after initial stake.
        uint256 stakeAmount;
        // Identifier pointing to terms of commitment, which functions as a SLA (Service Layer Agreement) economically
        // binding the staker to the terms of the commitment otherwise their stake amount can be slashed.
        // This could be a UMIP identifier or an IPFS hash, for example.
        bytes32 commitmentTermsIdentifier;
    }

    // A withdrawal attempt represents a request by the staker in a commitment to withdraw their tokens following
    // a challenge period.
    struct Withdrawal {
        // Time when withdrawal request can be finalized.
        uint256 finalizationTimestamp;
    }

    // A bonk attempt represents a request by someone to slash a commitment's stake because of a violation of the
    // the commitment terms. The slash recipient and slash amount should be based on the commitment terms and the level
    // of transgression.
    struct Bonk {
        address bonker;
        // Address where slashed funds are sent to. Ideally is a contract
        // that shares the slash profits amongst stakeholders.
        address bonkRewardRecipient;
        // Amount to slash. Should be based on the commitment terms and the level of violation by the staker.
        uint256 bonkAmount;
        // Time when slash attempt can be finalized.
        uint256 finalizationTimestamp;
    }
}
