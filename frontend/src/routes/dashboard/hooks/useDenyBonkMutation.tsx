import { useMutation } from "@tanstack/react-query";

import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { COMMITMENT_STORE_ABI } from "../../../lib/constants/abis";
import { COMMITMENT_STORE_ADDRESS } from "../../../lib/constants/addresses";

import { useAllCommitmentsQuery } from "./useAllCommitments";
import { useMyCommitmentsQuery } from "./useMyCommitments";

export function useDenyBonkMutation(opts?: { onSuccess?: () => void }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { refetch: refetchAllCommitments } = useAllCommitmentsQuery();
  const { refetch: refetchMyCommitments } = useMyCommitmentsQuery();

  return useMutation({
    mutationFn: async (slashArgs: { stakerId: string }) => {
      if (!address || !address || !walletClient) {
        throw new Error("Address not found");
      }

      if (address) {
        const { request } = await publicClient.simulateContract({
          account: address,
          abi: COMMITMENT_STORE_ABI,
          address: COMMITMENT_STORE_ADDRESS,
          functionName: "denyBonk",
          args: [slashArgs.stakerId as `0x${string}`],
        });
        const denyBonkTxHash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({
          hash: denyBonkTxHash,
        });
        refetchAllCommitments();
        refetchMyCommitments();
      }
    },
    onSuccess: opts?.onSuccess,
  });
}
