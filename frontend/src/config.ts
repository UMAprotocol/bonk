import { configureChains, mainnet } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";

export const infuraApiKey: string = import.meta.env.VITE_INFURA_API_KEY;
export const walletConnectProjectId: string = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID;

export const { chains, publicClient } = configureChains(
  [mainnet],
  [infuraProvider({ apiKey: infuraApiKey }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Smooth Me Daddy",
  projectId: walletConnectProjectId,
  chains,
});

export const injectedConnector = new InjectedConnector({ chains });
export const metaMaskConnector = new MetaMaskConnector({ chains });

export const config = {
  infura: {
    apiKey: infuraApiKey,
  },
  wagmi: {
    chains,
    publicClient,
    connectors,
  },
};

console.log(config);
