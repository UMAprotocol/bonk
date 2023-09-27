import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useAccount } from "wagmi";

import { COMMITMENT_STORE_ADDRESS } from "../../../lib/constants/addresses";
import { COMMITMENT_STORE_ABI } from "../../../lib/constants/abis";
import { fetchFromIPFS } from "../../../lib/api/pinata";
import { parseCIDV0Bytes32 } from "../../../lib/utils/ipfs";
import { config } from "../../../config";

export function useMyCommitmentsQuery() {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryKey: ["my-commitments", address],
    queryFn: async () => {
      if (!address) {
        return [];
      }

      const [
        myCommitments,
        myBonkAttempts,
        myBonkDenies,
        myBonkSucceeds,
        myWithdrawalRequests,
        myWithdrawalFinalizations,
      ] = await Promise.all([
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "NewCommitment",
          fromBlock: config.web3.events.fromBlock,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkAttempt",
          fromBlock: config.web3.events.fromBlock,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkDenied",
          fromBlock: config.web3.events.fromBlock,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkSucceeded",
          fromBlock: config.web3.events.fromBlock,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "RequestCommitmentWithdrawal",
          fromBlock: config.web3.events.fromBlock,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "FinalizedCommitmentWithdrawal",
          fromBlock: config.web3.events.fromBlock,
          args: {
            staker: address,
          },
        }),
      ]);

      const commitmentsWithTerms = await Promise.all(
        myCommitments.map(async (commitment) => {
          const { args } = commitment;
          const { commitmentTerms } = args;

          if (commitmentTerms) {
            const termsCid = parseCIDV0Bytes32(commitmentTerms);
            const terms = await fetchFromIPFS(termsCid);

            if (!terms || !terms.title || !terms.description) {
              return null;
            }
            const bonkDeny = myBonkDenies.find(
              (bonkDeny) => bonkDeny.args.stakerId === commitment.args.stakerId
            );
            const bonkSucceed = myBonkSucceeds.find(
              (bonkSucceed) =>
                bonkSucceed.args.stakerId === commitment.args.stakerId
            );
            const bonkAttempt = myBonkAttempts.find(
              (bonkAttempt) =>
                bonkAttempt.args.stakerId === commitment.args.stakerId
            );
            const withdrawalRequest = myWithdrawalRequests.find(
              (withdrawalRequest) =>
                withdrawalRequest.args.stakerId === commitment.args.stakerId
            );
            const withdrawalFinalization = myWithdrawalFinalizations.find(
              (withdrawalFinalization) =>
                withdrawalFinalization.args.stakerId ===
                commitment.args.stakerId
            );

            const finalizationTimestamp = bonkAttempt
              ? (
                  await publicClient.readContract({
                    address: COMMITMENT_STORE_ADDRESS,
                    abi: COMMITMENT_STORE_ABI,
                    functionName: "bonks",
                    args: [commitment.args.stakerId!],
                  })
                )[3]
              : withdrawalRequest
              ? withdrawalRequest.args.finalizationTimestamp
              : undefined;

            return {
              ...commitment,
              terms,
              finalizationTimestamp: finalizationTimestamp,
              status: bonkDeny
                ? "bonk-denied"
                : bonkSucceed
                ? "bonked"
                : bonkAttempt
                ? "bonk-proposed"
                : withdrawalFinalization
                ? "withdrawn"
                : withdrawalRequest
                ? "withdrawal-requested"
                : "committed",
            };
          } else {
            return null;
          }
        })
      );

      return commitmentsWithTerms.filter((commitment) => commitment !== null);
    },
  });
}
