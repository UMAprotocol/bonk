import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

import { COMMITMENT_STORE_ADDRESS } from "../../../lib/constants/addresses";
import { COMMITMENT_STORE_ABI } from "../../../lib/constants/abis";
import { fetchFromIPFS } from "../../../lib/api/pinata";
import { parseCIDV0Bytes32 } from "../../../lib/utils/ipfs";

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
          fromBlock: 9762022n,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkAttempt",
          fromBlock: 9762022n,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkDenied",
          fromBlock: 9762022n,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkSucceeded",
          fromBlock: 9762022n,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "RequestCommitmentWithdrawal",
          fromBlock: 9762022n,
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "FinalizedCommitmentWithdrawal",
          fromBlock: 9762022n,
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

            return {
              ...commitment,
              terms,
              status: bonkDeny
                ? "bonk-denied"
                : bonkSucceed
                ? "bonked"
                : bonkAttempt
                ? "bonk-proposed"
                : withdrawalRequest
                ? "withdrawal-requested"
                : withdrawalFinalization
                ? "withdrawn"
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
