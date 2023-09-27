import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { SLATable } from "./sla-table";
import { useMyCommitmentsQuery } from "../hooks/useMyCommitments";
import { formatRawSLAs } from "../lib/utils";

export function MySLAs() {
  const { isConnected } = useAccount();
  const { data, isLoading } = useMyCommitmentsQuery();
  const formattedData = formatRawSLAs(data || []);

  return (
    <div className="card bg-base-100">
      <div className="card-body">
        {!isConnected ? (
          <div>
            <ConnectButton />
          </div>
        ) : isLoading ? (
          <span className="loading loading-lg"></span>
        ) : (
          <SLATable slaList={formattedData} isMySLA isConnected={isConnected} />
        )}
      </div>
    </div>
  );
}
