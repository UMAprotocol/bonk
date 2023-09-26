import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useAccount } from "wagmi";

import { COMMITMENT_STORE_ADDRESS } from "../../../lib/constants/addresses";
import { COMMITMENT_STORE_ABI } from "../../../lib/constants/abis";
import { fetchFromIPFS } from "../../../lib/api/pinata";
import { parseCIDV0Bytes32 } from "../../../lib/utils/ipfs";

export function useMyCommitmentsQuery() {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  return useQuery({
    enabled: !!address,
    queryKey: ["my-commitments", address],
    queryFn: async () => {
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
          fromBlock: 9762022n,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkAttempt",
          fromBlock: 9762022n,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkDenied",
          fromBlock: 9762022n,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "BonkSucceeded",
          fromBlock: 9762022n,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "RequestCommitmentWithdrawal",
          fromBlock: 9762022n,
          args: {
            staker: address,
          },
        }),
        publicClient.getContractEvents({
          address: COMMITMENT_STORE_ADDRESS,
          abi: COMMITMENT_STORE_ABI,
          eventName: "FinalizedCommitmentWithdrawal",
          fromBlock: 9762022n,
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
