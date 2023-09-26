import { SLATable } from "./sla-table";
import { useMyCommitmentsQuery } from "../hooks/useMyCommitments";
import { formatRawSLAs } from "../lib/utils";

export function MySLAs() {
  const { data, isLoading } = useMyCommitmentsQuery();
  const formattedData = formatRawSLAs(data || []);

  return (
    <div className="card bg-base-100">
      <div className="card-body">
        {isLoading ? (
          <span className="loading loading-lg"></span>
        ) : (
          <SLATable slaList={formattedData} isMySLA />
        )}
      </div>
    </div>
  );
}
