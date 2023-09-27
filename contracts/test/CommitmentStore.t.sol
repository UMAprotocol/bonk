pragma solidity ^0.8.0;

import "forge-std/console.sol";
import "forge-std/Test.sol";

import "../src/CommitmentStore.sol";
import "../src/ICommitmentStore.sol";
import "./MockOracle.sol";
import "./MintableERC20.sol";

contract CommitmentStoreTest is Test {
    address internal committer;
    address internal bonker;

    uint256 internal constant startingBalance = 100e18;
    uint256 internal constant bonkBond = 1e18;
    MintableERC20 internal stakeToken;
    MockOracle internal oracle;

    // Tested
    CommitmentStore internal store;

    function setUp() public {
        committer = makeAddr("committer");
        bonker = makeAddr("bonker");

        oracle = new MockOracle();
        stakeToken = new MintableERC20("Test Token", "TEST");
        stakeToken.mint(committer, startingBalance);
        stakeToken.mint(bonker, bonkBond);
        store = new CommitmentStore(oracle, bonkBond, IERC20(stakeToken));
        vm.prank(committer);
        stakeToken.approve(address(store), startingBalance+bonkBond);
        vm.prank(bonker);
        stakeToken.approve(address(store), bonkBond);
    }

    // Test that normal commitment can be made.
    function test_makeCommitment() public {
        vm.prank(committer);
        uint256 stakeAmount = 10e18;
        bytes32 stakerId = bytes32("MEV_RELAY_SLA");
        store.makeCommitment(
            stakerId,
            ICommitmentStore.Commitment({
                staker: committer,
                stakeToken: IERC20(stakeToken),
                stakeAmount: stakeAmount,
                commitmentTermsIdentifier: bytes32("100_WAYS_TO_TRUST_ME")
            })
        );
        assertEq(stakeToken.balanceOf(address(store)), stakeAmount);
        assertEq(stakeToken.balanceOf(address(committer)), startingBalance - stakeAmount);

        (address _staker,,,) = store.commitments(stakerId);
        assertEq(_staker, committer);
    }

    // Test that normal bonk can be made and pays out the bonk recipient.
    function test_bonk() public {
        vm.prank(committer);
        uint256 stakeAmount = 10e18;
        bytes32 stakerId = bytes32("MEV_RELAY_SLA");
        store.makeCommitment(
            stakerId,
            ICommitmentStore.Commitment({
                staker: committer,
                stakeToken: IERC20(stakeToken),
                stakeAmount: stakeAmount,
                commitmentTermsIdentifier: bytes32("100_WAYS_TO_TRUST_ME")
            })
        );

        uint256 slashAmount = stakeAmount / 2;
        vm.prank(bonker);
        store.bonk(stakerId, bonker, bytes32("YOU_LIED_TO_ME"), slashAmount);
        assertEq(stakeToken.balanceOf(address(bonker)), 0);
        assertEq(stakeToken.balanceOf(address(store)), stakeAmount + bonkBond);

        (address _bonker,,,) = store.bonks(stakerId);
        assertEq(_bonker, bonker);

        // Advance time and finalize bonk
        vm.warp(block.timestamp + 1 days);
        store.finalizeBonk(stakerId);
        assertEq(stakeToken.balanceOf(address(bonker)), bonkBond + slashAmount);
        (,,uint256 _stakeAmount,) = store.commitments(stakerId);
        assertEq(_stakeAmount, stakeAmount - slashAmount);
        (address _deletedBonker,,,) = store.bonks(stakerId);
        assertEq(_deletedBonker, address(0));
    }

    function test_denyBonk() public {
        vm.prank(committer);
        uint256 stakeAmount = 10e18;
        bytes32 stakerId = bytes32("MEV_RELAY_SLA");
        store.makeCommitment(
            stakerId,
            ICommitmentStore.Commitment({
                staker: committer,
                stakeToken: IERC20(stakeToken),
                stakeAmount: stakeAmount,
                commitmentTermsIdentifier: bytes32("100_WAYS_TO_TRUST_ME")
            })
        );

        uint256 slashAmount = stakeAmount / 2;
        vm.prank(bonker);
        store.bonk(stakerId, bonker, bytes32("YOU_LIED_TO_ME"), slashAmount);

        vm.prank(committer);
        store.denyBonk(stakerId);
        // assertEq(stakeToken.balanceOf(address(store)), stakeAmount + bonkBond * 2);
        (address _bonker,,,) = store.bonks(stakerId);
        assertEq(_bonker, address(0));

    }
}
