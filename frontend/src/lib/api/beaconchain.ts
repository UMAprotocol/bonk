const baseUrl = "https://beaconcha.in/api/v1";

export async function fetchValidator(validatorPubKeyOrIndex: string): Promise<{
  activationeligibilityepoch: number;
  activationepoch: number;
  balance: number;
  effectivebalance: number;
  exitepoch: number;
  lastattestationslot: number;
  name: string;
  pubkey: string;
  slashed: boolean;
  status: string;
  validatorindex: number;
  withdrawableepoch: number;
  withdrawalcredentials: string;
  total_withdrawals: number;
}> {
  return (
    await (await fetch(`${baseUrl}/validator/${validatorPubKeyOrIndex}`)).json()
  ).data;
}
