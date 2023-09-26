import { SLATable } from "./sla-table";
import { useAllCommitmentsQuery } from "../hooks/useAllCommitments";
import { formatRawSLAs } from "../lib/utils";

export function AllSLAs() {
  const { data, isLoading } = useAllCommitmentsQuery();
  const formattedData = formatRawSLAs(data || []);

  return (
    <div className="card bg-base-100">
      <div className="card-body">
        {isLoading ? (
          <span className="loading loading-lg"></span>
        ) : (
          <SLATable slaList={formattedData} isMySLA={false} />
        )}
      </div>
    </div>
  );
}
