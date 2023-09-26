import { useState } from "react";
import { useAccount } from "wagmi";

import { Layout } from "../../components/layout";
import { useOpenModal } from "../../hooks/useOpenModal";

import { AllSLAs } from "./components/all-slas";
import { MySLAs } from "./components/my-slas";
import { DashboardTabs, DashboardTab } from "./components/dashboard-tabs";
import { CreateSLAModal } from "./components/create-sla-modal";

export default function DashboardOverview() {
  const [selectedTab, setSelectedTab] = useState<DashboardTab>("all");

  const { isConnected } = useAccount();
  const openModal = useOpenModal();

  console.log("reneder");

  return (
    <Layout>
      <div className="flex flex-row justify-between items-center">
        <div className="w-36"></div>
        <DashboardTabs selectedTab={selectedTab} onTabClick={setSelectedTab} />
        <div className="w-36">
          {isConnected && (
            <button
              className="btn btn-primary"
              onClick={() => openModal("create-sla-modal")}
            >
              + Create SLA
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-row justify-center">
        {selectedTab === "all" && <AllSLAs />}
        {selectedTab === "my" && <MySLAs />}
      </div>
      <CreateSLAModal modalId="create-sla-modal" />
    </Layout>
  );
}
