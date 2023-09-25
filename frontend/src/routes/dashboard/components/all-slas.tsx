import { SLATable } from "./sla-table";

const MOCKED_SLAS = [
  {
    name: "Ultra Sound Relayer",
    description: "Commitment to be good relayer",
    tags: ["ultrasound", "mev", "relayer"],
    stakedAmount: 1,
  },
  {
    name: "Ultra Sound Relayer",
    description: "Commitment to be good relayer",
    tags: ["ultrasound", "mev", "relayer"],
    stakedAmount: 1,
  },
  {
    name: "Ultra Sound Relayer",
    description: "Commitment to be good relayer",
    tags: ["ultrasound", "mev", "relayer"],
    stakedAmount: 1,
  },
];

export function AllSLAs() {
  return (
    <div className="card bg-base-100">
      <div className="card-body">
        <SLATable slaList={MOCKED_SLAS} />
      </div>
    </div>
  );
}
