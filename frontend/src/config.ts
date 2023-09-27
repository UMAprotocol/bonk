import { configureChains } from "wagmi";
import { goerli } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";

export const infuraApiKey: string = import.meta.env.VITE_INFURA_API_KEY;
export const walletConnectProjectId: string = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID;
export const pinataJwt: string = import.meta.env.VITE_PINATA_JWT;
export const pinataToken: string = import.meta.env.VITE_PINATA_TOKEN;
export const eventsFromBlock: bigint = BigInt(
  import.meta.env.VITE_EVENTS_FROM_BLOCK || 9763922
);

export const { chains, publicClient } = configureChains(
  [goerli],
  [infuraProvider({ apiKey: infuraApiKey }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "BONK",
  projectId: walletConnectProjectId,
  chains,
});

export const injectedConnector = new InjectedConnector({ chains });
export const metaMaskConnector = new MetaMaskConnector({ chains });

export const config = {
  pinata: {
    jwt: pinataJwt,
    token: pinataToken,
  },
  infura: {
    apiKey: infuraApiKey,
  },
  wagmi: {
    chains,
    publicClient,
    connectors,
  },
  web3: {
    events: {
      fromBlock: eventsFromBlock,
    },
  },
};
