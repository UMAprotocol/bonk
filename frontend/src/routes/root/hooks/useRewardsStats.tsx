import { useQuery } from "@tanstack/react-query";

import { useValidatorQuery } from "../../../hooks/useValidator";

export function useRewardsStatsQuery(validatorPubKeyOrIndex: string) {
  const validatorQuery = useValidatorQuery(validatorPubKeyOrIndex);

  return useQuery({
    queryKey: ["rewards-stats", validatorPubKeyOrIndex],
    queryFn: async () => {
      // TODO: fetch from beacon chain API
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 1000);
      });

      return {
        earned: "1.0001",
        couldHaveEarned: "1.3001",
        blocksProposed: 5,
        avgDaysBetweenProposals: 112,
        expectedProposalIn: 33,
      };
    },
    enabled: validatorPubKeyOrIndex !== "" && validatorQuery.isSuccess,
  });
}
