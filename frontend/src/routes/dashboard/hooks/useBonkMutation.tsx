import { useMutation } from "@tanstack/react-query";

import { parseUnits, maxUint256, toHex } from "viem";
import { useAccount, usePublicClient, erc20ABI, useWalletClient } from "wagmi";

import { COMMITMENT_STORE_ABI } from "../../../lib/constants/abis";
import { COMMITMENT_STORE_ADDRESS } from "../../../lib/constants/addresses";

import { useAllCommitmentsQuery } from "./useAllCommitments";
import { useMyCommitmentsQuery } from "./useMyCommitments";

export function useBonkMutation(opts?: { onSuccess?: () => void }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { refetch: refetchAllCommitments } = useAllCommitmentsQuery();
  const { refetch: refetchMyCommitments } = useMyCommitmentsQuery();

  return useMutation({
    mutationFn: async (slashArgs: {
      stakerId: string;
      slashRecipient: string;
      details: string;
      slashAmount: string;
      stakingTokenSymbol: string;
      stakingTokenAmount: string;
    }) => {
      if (!address || !address || !walletClient) {
        throw new Error("Address not found");
      }

      const [slashTokenAddress, bonkBondAmount] = await Promise.all([
        publicClient.readContract({
          account: address,
          abi: COMMITMENT_STORE_ABI,
          address: COMMITMENT_STORE_ADDRESS,
          functionName: "slashToken",
        }),
        publicClient.readContract({
          account: address,
          abi: COMMITMENT_STORE_ABI,
          address: COMMITMENT_STORE_ADDRESS,
          functionName: "bonkBond",
        }),
      ]);

      const allowance = await publicClient.readContract({
        abi: erc20ABI,
        address: slashTokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [address, COMMITMENT_STORE_ADDRESS],
      });

      if (allowance < bonkBondAmount) {
        const { request } = await publicClient.simulateContract({
          account: address,
          abi: erc20ABI,
          address: slashTokenAddress,
          functionName: "approve",
          args: [COMMITMENT_STORE_ADDRESS, maxUint256],
        });
        const approveTxHash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({
          hash: approveTxHash,
        });
      }

      const parsedSlashAmount = parseUnits(String(slashArgs.slashAmount), 6);

      if (address) {
        const { request } = await publicClient.simulateContract({
          account: address,
          abi: COMMITMENT_STORE_ABI,
          address: COMMITMENT_STORE_ADDRESS,
          functionName: "bonk",
          args: [
            slashArgs.stakerId as `0x${string}`,
            slashArgs.slashRecipient as `0x${string}`,
            toHex(slashArgs.details, { size: 32 }),
            parsedSlashAmount,
          ],
        });
        const bonkTxHash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({
          hash: bonkTxHash,
        });
        refetchAllCommitments();
        refetchMyCommitments();
      }
    },
    onSuccess: opts?.onSuccess,
  });
}
