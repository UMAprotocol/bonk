export const COMMITMENT_STORE_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_resolutionOracle",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_slashBond",
        type: "uint256",
      },
      {
        internalType: "contract IERC20",
        name: "_slashToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ActiveBonk",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyRequested",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficentStake",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSlashAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "NoCommitment",
    type: "error",
  },
  {
    inputs: [],
    name: "NonZeroStake",
    type: "error",
  },
  {
    inputs: [],
    name: "NotStaker",
    type: "error",
  },
  {
    inputs: [],
    name: "PassedLiveness",
    type: "error",
  },
  {
    inputs: [],
    name: "Pending",
    type: "error",
  },
  {
    inputs: [],
    name: "SlashDoesNotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroStake",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bonker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "slashAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "slashRecipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "details",
        type: "bytes32",
      },
    ],
    name: "BonkAttempt",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bonker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "denier",
        type: "address",
      },
    ],
    name: "BonkDenied",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bonker",
        type: "address",
      },
    ],
    name: "BonkSucceeded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
    ],
    name: "FinalizedCommitmentWithdrawal",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stakeAmount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "commitmentTerms",
        type: "bytes32",
      },
    ],
    name: "NewCommitment",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "finalizationTimestamp",
        type: "uint256",
      },
    ],
    name: "RequestCommitmentWithdrawal",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "slashRecipient",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "details",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "slashAmount",
        type: "uint256",
      },
    ],
    name: "bonk",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "bonks",
    outputs: [
      {
        internalType: "address",
        name: "bonker",
        type: "address",
      },
      {
        internalType: "address",
        name: "bonkRewardRecipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bonkAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "finalizationTimestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "challengePeriod",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "commitments",
    outputs: [
      {
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "stakeToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "stakeAmount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "commitmentTermsIdentifier",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
    ],
    name: "denyBonk",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
    ],
    name: "finalizeBonk",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
    ],
    name: "finalizeWithdrawStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "address",
            name: "staker",
            type: "address",
          },
          {
            internalType: "contract IERC20",
            name: "stakeToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "stakeAmount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "commitmentTermsIdentifier",
            type: "bytes32",
          },
        ],
        internalType: "struct ICommitmentStore.Commitment",
        name: "commitment",
        type: "tuple",
      },
    ],
    name: "makeCommitment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "stakerId",
        type: "bytes32",
      },
    ],
    name: "requestWithdrawStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "resolutionOracle",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "slashBond",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "slashToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "withdrawals",
    outputs: [
      {
        internalType: "uint256",
        name: "finalizationTimestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
