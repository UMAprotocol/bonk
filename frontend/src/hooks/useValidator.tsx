import { useQuery } from "@tanstack/react-query";

import { fetchValidator } from "../lib/api/beaconchain";

export function useValidatorQuery(validatorPubKeyOrIndex: string) {
  return useQuery({
    queryKey: ["validator", validatorPubKeyOrIndex],
    queryFn: async () => {
      const validator = await fetchValidator(validatorPubKeyOrIndex);

      return validator;
    },
    enabled: validatorPubKeyOrIndex !== "",
  });
}
