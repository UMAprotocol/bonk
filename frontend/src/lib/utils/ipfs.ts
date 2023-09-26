import { base58btc } from "multiformats/bases/base58";
import { hexToBytes } from "viem";

export function parseCIDV0Bytes32(cidV0Bytes32: string) {
  const remove0x = cidV0Bytes32.slice(2);
  // add back the multihash id
  const bytes = hexToBytes(`0x1220${remove0x}`);
  const hash = base58btc.baseEncode(bytes);
  return hash;
}
