// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatRawSLAs(rawSLAs: any[]) {
  return (
    rawSLAs.map(
      (commitment) =>
        ({
          id: commitment?.args.stakerId?.toString() || "",
          name: commitment?.terms.title || "",
          description: commitment?.terms.description || "",
          stakedAmount: commitment?.args.stakeAmount || 0,
          stakingTokenSymbol: "USDC",
          status: "committed",
        } as const)
    ) || []
  );
}
