import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

import { COMMITMENT_STORE_ADDRESS } from "../../../lib/constants/addresses";
import { COMMITMENT_STORE_ABI } from "../../../lib/constants/abis";
import { fetchFromIPFS } from "../../../lib/api/pinata";
import { parseCIDV0Bytes32 } from "../../../lib/utils/ipfs";
import { config } from "../../../config";

export function useAllCommitmentsQuery() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["all-commitments"],
    queryFn: async () => {
      const [
        allCommitments,
        allBonkAttempts,
        allBonkDenies,
        allBonkSucceeds,
        allWithdrawalRequests,
        allWithdrawalFinalizations,
      ] = await Promise.all([
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "NewCommitment",
          fromBlock: config.web3.events.fromBlock,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkAttempt",
          fromBlock: config.web3.events.fromBlock,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkDenied",
          fromBlock: config.web3.events.fromBlock,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkSucceeded",
          fromBlock: config.web3.events.fromBlock,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "RequestCommitmentWithdrawal",
          fromBlock: config.web3.events.fromBlock,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "FinalizedCommitmentWithdrawal",
          fromBlock: config.web3.events.fromBlock,
        }),
      ]);

      const commitmentsWithTerms = await Promise.all(
        allCommitments.map(async (commitment) => {
          const { args } = commitment;
          const { commitmentTerms } = args;

          if (commitmentTerms) {
            const termsCid = parseCIDV0Bytes32(commitmentTerms);
            const terms = await fetchFromIPFS(termsCid);

            if (!terms || !terms.title || !terms.description) {
              return null;
            }

            // determine status
            const bonkDeny = allBonkDenies.find(
              (bonkDeny) => bonkDeny.args.stakerId === commitment.args.stakerId
            );
            const bonkSucceed = allBonkSucceeds.find(
              (bonkSucceed) =>
                bonkSucceed.args.stakerId === commitment.args.stakerId
            );
            const bonkAttempt = allBonkAttempts.find(
              (bonkAttempt) =>
                bonkAttempt.args.stakerId === commitment.args.stakerId
            );
            const withdrawalRequest = allWithdrawalRequests.find(
              (withdrawalRequest) =>
                withdrawalRequest.args.stakerId === commitment.args.stakerId
            );
            const withdrawalFinalization = allWithdrawalFinalizations.find(
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
              finalizationTimestamp,
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
