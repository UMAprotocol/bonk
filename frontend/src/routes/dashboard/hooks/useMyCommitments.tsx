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
      const myCommitments = await publicClient.getContractEvents({
        address: COMMITMENT_STORE_ADDRESS,
        abi: COMMITMENT_STORE_ABI,
        eventName: "NewCommitment",
        fromBlock: 9762022n,
        args: {
          staker: address,
        },
      });

      const commitmentsWithTerms = await Promise.all(
        myCommitments.map(async (commitment, i) => {
          if (i < 1) {
            // skip
            return null;
          }

          const { args } = commitment;
          const { commitmentTerms } = args;

          if (commitmentTerms) {
            const termsCid = parseCIDV0Bytes32(commitmentTerms);
            const terms = await fetchFromIPFS(termsCid);

            if (!terms || !terms.title || !terms.description) {
              return null;
            }

            return {
              ...commitment,
              terms,
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
