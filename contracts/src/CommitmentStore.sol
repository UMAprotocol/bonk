// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import { ICommitmentStore } from "./ICommitmentStore.sol";
import { IERC20 } from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

// Features we would add in the future:
// - Ability for staker to earn revenue in exchange for staking. This could be used for example by MEV relays
//   who are willing to enter into an SLA promising to offer premier services (i.e. X% of slot share or always in
//   top 3 of relays etc.) in exchange for charging builders/validators a fee.
// - Ability for there to be multiple stakers (i.e. mapping(address=>uint256) stakers)
//   for each commitment. Would increase complexity for slashing logic such that all stakers
//   are slashed equally.
// - Ability to add to or decrease stake without completely ending commitment.
// - Ability to change parameters post-construction like slash currency and amount.

// This contract stores a list of commitments that are economically secured by a stake. The stake is slashable
// if the commitment terms are breached. This contract could be used by a trusted MEV boost relay to signal
// that their relay end point is more trustworthy than others. Relays directly benefit from increased proposer/validator
// flow so they are naturally incentivized to provide additional assurances to their customers.
contract CommitmentStore is ICommitmentStore {
    using SafeERC20 for IERC20;

    // Constants that are hardcoded or set upon construction. In a future iteration of this contract these could be
    // modified post-construction.
    uint256 public constant challengePeriod = 1 hours;
    uint256 public immutable slashBond;
    IERC20 public immutable slashToken;

    // Contract address used to resolve bonks.
    address public resolutionOracle;

    // Mapping of staker unique identifiers to commitment information.
    mapping(bytes32 => Commitment) public commitments;
    // Mapping of staker unique identifiers to withdrawal attempts.
    mapping(bytes32 => Withdrawal) public withdrawals;
    // Mapping of staker unique identifiers to bonk attempts.
    mapping(bytes32 => Bonk) public bonks;

    constructor(address _resolutionOracle, uint256 _slashBond, IERC20 _slashToken) {
        resolutionOracle = _resolutionOracle;
        slashBond = _slashBond;
        slashToken = _slashToken;
    }

    /// CREATE NEW COMMITMENT AND DEPOSIT STAKE

    function makeCommitment(bytes32 stakerId, Commitment memory commitment) external {
        if (commitment.stakeAmount == 0) revert ZeroStake();
        if (commitment.staker != msg.sender) revert NotStaker();
        // Should there be an initial minimum stake amount?
        commitment.stakeToken.safeTransferFrom(msg.sender, address(this), commitment.stakeAmount);
        commitments[stakerId] = commitment;

        emit NewCommitment(stakerId, msg.sender, commitment.stakeAmount, commitment.commitmentTermsIdentifier);
    }

    /// WITHDRAW STAKE AND DELETE COMMITMENT

    /**
     * @notice Request to return staked tokens to staker, which can be finalized after a challenge period.
     * @dev Callable only by staker.
     * @dev Cannot request stake withdrawal while undergoing bonk. If staker is bonked during this withdrawal pending
     * period then they will need to re request a withdrawal.
     */
    function requestWithdrawStake(bytes32 stakerId) external {
        // Check if commitment exists for msg.sender.
        Commitment memory commitment = commitments[stakerId];
        if (commitment.stakeAmount == 0) revert NoCommitment();
        if (commitment.staker != msg.sender) revert NotStaker();

        // Make sure there are no active bonks.
        if (bonks[stakerId].finalizationTimestamp > 0) revert ActiveBonk();

        // Create new withdrawal request for msg.sender
        Withdrawal storage withdrawal = withdrawals[stakerId];
        if (withdrawal.finalizationTimestamp != 0) revert AlreadyRequested();
        withdrawal.finalizationTimestamp = block.timestamp + challengePeriod;

        emit RequestCommitmentWithdrawal(stakerId, msg.sender, withdrawal.finalizationTimestamp);
    }

    function finalizeWithdrawStake(bytes32 stakerId) external {
        Withdrawal storage withdrawal = withdrawals[stakerId];
        if (block.timestamp < withdrawal.finalizationTimestamp) revert Pending();

        // Clean up and return stake.
        delete withdrawals[stakerId];
        Commitment memory commitment = commitments[stakerId];
        delete commitments[stakerId];

        // Return stake to staker.
        commitment.stakeToken.safeTransfer(commitment.staker, commitment.stakeAmount);

        emit FinalizedCommitmentWithdrawal(stakerId, msg.sender);
    }

    /// SLASH STAKE AND DELETE COMMITMENT

    /**
     * @dev Deletes any active withdrawal requests for staker.
     * @param slashAmount Amount of stake to slash, which should be determined by the staker's commitment and
     * level of violation.
     * @param slashRecipient Recipient who would receive a successful bonk. Also should be determined by staker's
     * commitment terms.
     * @param details Additional data provided by slasher to describe slash. We might not use this parameter at all
     * but wanted to provide it for demonstration purposes. For example, might be a link to some IPFS hash
     * that describes the error conditions triggered by the staker, or could be a merkle root containing
     * information.
     */
    function bonk(bytes32 stakerId, address slashRecipient, bytes32 details, uint256 slashAmount) external payable {
        // Slash bond amount must be equal to current slashBond parameter.
        slashToken.safeTransferFrom(msg.sender, address(this), slashBond);

        // Check if commitment exists.
        Commitment memory commitment = commitments[stakerId];
        if (commitment.stakeAmount == 0) revert NoCommitment();

        // Create new slash request for msg.sender
        if (bonks[stakerId].finalizationTimestamp != 0) revert AlreadyRequested();
        if (slashAmount > commitment.stakeAmount || slashAmount == 0) revert InvalidSlashAmount();
        bonks[stakerId] = Bonk({
            bonker: msg.sender,
            bonkRewardRecipient: slashRecipient,
            bonkAmount: slashAmount,
            finalizationTimestamp: block.timestamp + challengePeriod
        });

        // Delete any withdrawal requests.
        delete withdrawals[stakerId];

        emit BonkAttempt(stakerId, commitment.staker, msg.sender, slashAmount, slashRecipient, details);
    }

    function denyBonk(bytes32 stakerId) external payable {
        Bonk memory bonkAttempt = bonks[stakerId];
        if (bonkAttempt.bonkAmount == 0) revert SlashDoesNotExist();
        if (block.timestamp >= bonkAttempt.finalizationTimestamp) revert PassedLiveness();

        // TODO: At this point, create an OptimisticOracle assertion and send to DVM for resolution.
        // Pull a bond from the msg.sender, and use the slasher's bond plus this dispute bond to payout the
        // winner of the dispute.

        // Delete bonk. If slasher wants to re-bonk, they must send a new bond.
        delete bonks[stakerId];
        emit BonkDenied(stakerId, commitments[stakerId].staker, bonks[stakerId].bonker, msg.sender);
    }

    function finalizeBonk(bytes32 stakerId) external {
        Bonk memory bonkAttempt = bonks[stakerId];
        if (block.timestamp < bonkAttempt.finalizationTimestamp) revert Pending();

        // Slash stake and send to slash recipient.
        uint256 amountToSlash = bonkAttempt.bonkAmount;
        address slashRecipient = bonkAttempt.bonkRewardRecipient;

        // Clean up.
        delete bonks[stakerId];
        commitments[stakerId].stakeAmount -= amountToSlash;
        if (commitments[stakerId].stakeAmount == 0) {
            delete commitments[stakerId];
        }

        // Payout.
        slashToken.safeTransfer(bonkAttempt.bonker, slashBond);
        commitments[stakerId].stakeToken.safeTransfer(slashRecipient, amountToSlash);

        emit BonkSucceeded(stakerId, commitments[stakerId].staker, bonkAttempt.bonker);
    }
}
