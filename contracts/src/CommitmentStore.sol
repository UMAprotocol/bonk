// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import {ICommitmentStore} from "./ICommitmentStore.sol";
import {Address} from "openzeppelin-contracts/contracts/utils/Address.sol";

// Features we would add in the future:
// - Ability for there to be multiple stakers (i.e. mapping(address=>uint256) stakers)
//   for each commitment. Would increase complexity for slashing logic such that all stakers
//   are slashed equally.
// - Ability to add to or decrease stake without completely ending commitment.
contract CommitmentStore is ICommitmentStore {
    using Address for address;

    uint256 public constant challengePeriod = 1 hours;
    uint256 public constant slashBond = 0.5 ether;

    mapping(address => Commitment) public commitments;
    mapping(address => Withdrawal) public withdrawals;
    mapping(address => Slash) public bonks;
    struct Commitment {
        // Slashable amount of tokens for this commitment. Can be
        // added to after initial stake.
        uint256 stakeAmount;
        // URL to readable terms of commitment detailing slashing conditions.
        bytes commitmentTermsUrl;
        // Address where slashed funds are sent to. Ideally is a contract
        // that shares the slash profits amongst stakeholders.
        address slashRecipient;
    }

    struct Withdrawal {
        // Time when withdrawal request can be finalized.
        uint256 finalizationTimestamp;
    }

    struct Slash {
        address stakerToSlash;
        // Time when slash attempt can be finalized.
        uint256 finalizationTimestamp;
        // Economic stake deposited by slasher, disincentives griefing by sending false slashes.
        uint256 bond;
    }

    /// CREATE NEW COMMITMENT AND DEPOSIT STAKE

    function makeCommitment(Commitment memory commitment) external payable {
        if (commitment.stakeAmount == 0) revert ZeroStake();
        // Should there be an initial minimum stake amount?
        if (msg.value != commitment.stakeAmount) revert InsufficientMsgValue();
        commitments[msg.sender] = commitment;
    }

    /// WITHDRAW STAKE AND DELETE COMMITMENT

    /**
     * @dev Cannot request stake withdrawal while undergoing bonk.
     */
    function requestWithdrawStake() external {
        // Check if commitment exists for msg.sender.
        Commitment memory commitment = commitments[msg.sender];
        if (commitment.stakeAmount == 0) revert NoCommitment();

        // Make sure there are no active bonks.
        if (bonks[msg.sender].finalizationTimestamp > 0) revert ActiveBonk();

        // Create new withdrawal request for msg.sender
        Withdrawal storage withdrawal = withdrawals[msg.sender];
        if (withdrawal.finalizationTimestamp != 0) revert AlreadyRequested();
        withdrawal.finalizationTimestamp = block.timestamp + challengePeriod;
    }

    function finalizeWithdrawStake() external {
        Withdrawal storage withdrawal = withdrawals[msg.sender];
        if (block.timestamp < withdrawal.finalizationTimestamp) revert Pending();
        uint256 amountToSend = commitments[msg.sender].stakeAmount;

        // Clean up and return stake.
        delete withdrawals[msg.sender];
        delete commitments[msg.sender];
        Address.sendValue(payable(msg.sender), amountToSend);
    }

    /// SLASH STAKE AND DELETE COMMITMENT

    /**
     * @dev Deletes any active withdrawal requests for staker.
     */
    function bonk(
        address stakerToSlash,
        // @TODO: Figure out how slasher can provide details of slash.
        bytes memory details
    ) external payable {
        // Slash bond sent in as msg.value must be equal to current slashBond parameter.
        if (msg.value != slashBond) revert InsufficientMsgValue();

        // Check if commitment exists.
        Commitment memory commitment = commitments[stakerToSlash];
        if (commitment.stakeAmount == 0) revert NoCommitment();

        // Create new slash request for msg.sender
        Slash storage slash = bonks[msg.sender];
        if (slash.finalizationTimestamp != 0) revert AlreadyRequested();
        slash.finalizationTimestamp = block.timestamp + challengePeriod;
        slash.bond = msg.value;
        slash.stakerToSlash = stakerToSlash;

        // Delete any withdrawal requests.
        delete withdrawals[stakerToSlash];
    }

    function denyBonk(address slasher) external payable {
        Slash memory slash = bonks[slasher];
        if (slash.bond == 0) revert SlashDoesNotExist();
        if (block.timestamp >= slash.finalizationTimestamp) revert PassedLiveness();

        // TODO: At this point, create an OptimisticOracle assertion and send to DVM for resolution.
        // Pull a bond from the msg.sender, and use the slasher's bond plus this dispute bond to payout the
        // winner of the dispute.

        // Delete bonk. If slasher wants to re-bonk, they must send a new bond.
        delete bonks[slasher];
    }

    function finalizeBonk(address slasher) external {
        Slash memory slash = bonks[slasher];
        if (block.timestamp < slash.finalizationTimestamp) revert Pending();

        // Return bond to slasher.
        uint256 bondToReturn = slash.bond;

        // Slash stake and send to slash recipient.
        uint256 amountToSlash = commitments[slash.stakerToSlash].stakeAmount;
        address slashRecipient = commitments[slash.stakerToSlash].slashRecipient;

        // Clean up.
        delete bonks[slasher];
        delete commitments[slash.stakerToSlash];
        Address.sendValue(payable(slasher), bondToReturn);
        Address.sendValue(payable(slashRecipient), amountToSlash);
    }
}
