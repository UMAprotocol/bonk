import { useMutation } from "@tanstack/react-query";
import { base58btc } from "multiformats/bases/base58";
import { CID } from "multiformats/cid";
import { toHex, parseUnits, maxUint256, bytesToHex } from "viem";
import { useAccount, usePublicClient, erc20ABI, useWalletClient } from "wagmi";

import { COMMITMENT_STORE_ABI } from "../../../lib/constants/abis";
import { COMMITMENT_STORE_ADDRESS } from "../../../lib/constants/addresses";
import { TOKENS } from "../../../lib/constants/tokens";
import { pinJSONToIPFS } from "../../../lib/api/pinata";

import { useAllCommitmentsQuery } from "./useAllCommitments";
import { useMyCommitmentsQuery } from "./useMyCommitments";

export function useCreateSLAMutation(opts?: { onSuccess?: () => void }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { refetch: refetchAllCommitments } = useAllCommitmentsQuery();
  const { refetch: refetchMyCommitments } = useMyCommitmentsQuery();

  return useMutation({
    mutationFn: async (slaToCreate: {
      title: string;
      description: string;
      stakingAmount: number;
      selectedStakingToken: string;
    }) => {
      const cidV0Bytes32 = await uploadTermsToIPFS({
        title: slaToCreate.title,
        description: slaToCreate.description,
      });
      const token = TOKENS.find(
        (token) => token.symbol === slaToCreate.selectedStakingToken
      );

      if (!address || !token || !address || !walletClient) {
        throw new Error("Address not found");
      }

      const parsedAmount = parseUnits(
        String(slaToCreate.stakingAmount),
        token.decimals
      );

      const allowance = await publicClient.readContract({
        abi: erc20ABI,
        address: token.address as `0x${string}`,
        functionName: "allowance",
        args: [address, COMMITMENT_STORE_ADDRESS],
      });

      if (allowance < parsedAmount) {
        const { request } = await publicClient.simulateContract({
          account: address,
          abi: erc20ABI,
          address: token.address as `0x${string}`,
          functionName: "approve",
          args: [COMMITMENT_STORE_ADDRESS, maxUint256],
        });
        const approveTxHash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({
          hash: approveTxHash,
        });
      }

      const commitmentId = slaToCreate.title + "_" + Date.now();

      if (token && address) {
        const { request } = await publicClient.simulateContract({
          account: address,
          abi: COMMITMENT_STORE_ABI,
          address: COMMITMENT_STORE_ADDRESS,
          functionName: "makeCommitment",
          args: [
            toHex(commitmentId, { size: 32 }),
            {
              staker: address,
              stakeToken: token.address as `0x${string}`,
              stakeAmount: parseUnits(
                String(slaToCreate.stakingAmount),
                token.decimals
              ),
              commitmentTermsIdentifier: cidV0Bytes32 as `0x{string}`,
            },
          ],
        });
        const makeCommitmentTxHash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({
          hash: makeCommitmentTxHash,
        });
        refetchAllCommitments();
        refetchMyCommitments();
      }
    },
    onSuccess: opts?.onSuccess,
  });
}

async function uploadTermsToIPFS(terms: {
  title: string;
  description: string;
}) {
  const { IpfsHash } = await pinJSONToIPFS(terms);
  const cid = CID.parse(IpfsHash);
  const cidV0Bytes32 = bytesToHex(
    base58btc.baseDecode(cid.toString()).slice(2)
  );
  console.log("cid", cidV0Bytes32);
  return cidV0Bytes32;
}
