import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig, createConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import Root from "./routes/root";
import About from "./routes/about";
import Dashboard from "./routes/dashboard";

import { config } from "./config";

// react-router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

// react-query
const queryClient = new QueryClient();

// wagmi
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: config.wagmi.connectors,
  publicClient: config.wagmi.publicClient,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={config.wagmi.chains}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
