export type SLA = {
  name: string;
  description: string;
  tags: string[];
  stakedAmount: number;
};

export function SLATable({ slaList }: { slaList: SLA[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Tags</th>
            <th>Total stake</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {slaList.map((sla) => (
            <SLARow sla={sla} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SLARow({ sla }: { sla: SLA }) {
  return (
    <tr>
      <td>{sla.name}</td>
      <td>{sla.description}</td>
      <td className="flex flex-col gap-1">
        {sla.tags.map((tag) => (
          <div className="badge">{tag}</div>
        ))}
      </td>
      <td>{sla.stakedAmount}</td>
      <th className="flex flex-col">
        <button className="btn btn-ghost btn-xs">Stake</button>
        <button className="btn btn-ghost btn-xs">Withdraw</button>
        <button className="btn btn-ghost btn-xs">Slash</button>
      </th>
    </tr>
  );
}
