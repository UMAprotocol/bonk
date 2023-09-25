import { useState } from "react";

import { Layout } from "../../components/layout";

import { AllSLAs } from "./components/all-slas";
import { MySLAs } from "./components/my-slas";
import { DashboardTabs, DashboardTab } from "./components/dashboard-tabs";

export default function DashboardOverview() {
  const [selectedTab, setSelectedTab] = useState<DashboardTab>("all");

  return (
    <Layout>
      <div className="flex flex-row justify-center">
        <DashboardTabs selectedTab={selectedTab} onTabClick={setSelectedTab} />
      </div>
      <div className="flex flex-row justify-center">
        {selectedTab === "all" && <AllSLAs />}
        {selectedTab === "my" && <MySLAs />}
      </div>
    </Layout>
  );
}
