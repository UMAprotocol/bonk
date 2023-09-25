import { clsx } from "clsx";

export type DashboardTab = "all" | "my";

export function DashboardTabs({
  onTabClick,
  selectedTab,
}: {
  onTabClick: (tab: DashboardTab) => void;
  selectedTab: DashboardTab;
}) {
  const handleTabClick = (tab: DashboardTab) => {
    onTabClick(tab);
  };

  return (
    <div className="tabs tabs-boxed my-8">
      <a
        className={clsx("tab", {
          "tab-active": selectedTab === "all",
        })}
        onClick={() => handleTabClick("all")}
      >
        All SLAs
      </a>
      <a
        className={clsx("tab", {
          "tab-active": selectedTab === "my",
        })}
        onClick={() => handleTabClick("my")}
      >
        My SLAs
      </a>
    </div>
  );
}
