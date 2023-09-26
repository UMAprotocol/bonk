import { useCallback, useState } from "react";
import clsx from "clsx";
import { formatUnits } from "viem";

import { BonkModal } from "./bonk-modal";
import { WithdrawModal } from "./withdraw-modal";

export type SLA = {
  id: string;
  name: string;
  description: string;
  stakedAmount: number | bigint;
  stakingTokenSymbol: string;
  status:
    | "committed"
    | "bonk-proposed"
    | "bonk-denied"
    | "bonked"
    | "withdrawal-requested"
    | "withdrawn";
};

export function SLATable({
  slaList,
  isMySLA,
}: {
  slaList: SLA[];
  isMySLA: boolean;
}) {
  const [slaToBonk, setSLAToBonk] = useState<SLA | undefined>();
  const [slaToWithdraw, setSLAToWithdraw] = useState<SLA | undefined>();

  const openModal = useCallback((modalId: string) => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Stake amount</th>
            <th>Staking token</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {slaList.map((sla) => (
            <SLARow
              key={sla.id}
              sla={sla}
              onClickWithdraw={() => {
                setSLAToWithdraw(sla);
                setTimeout(() => openModal("withdraw-modal"), 100);
              }}
              onClickSlash={() => {
                setSLAToBonk(sla);
                setTimeout(() => openModal("bonk-modal"), 100);
              }}
              isMySLA={isMySLA}
            />
          ))}
        </tbody>
      </table>
      {slaToBonk && (
        <BonkModal
          modalId="bonk-modal"
          sla={slaToBonk!}
          onClose={() => setSLAToBonk(undefined)}
        />
      )}
      {slaToWithdraw && (
        <WithdrawModal
          modalId="withdraw-modal"
          sla={slaToWithdraw!}
          onClose={() => setSLAToWithdraw(undefined)}
        />
      )}
    </div>
  );
}

function SLARow({
  sla,
  isMySLA,
  onClickWithdraw,
  onClickSlash,
}: {
  sla: SLA;
  isMySLA: boolean;
  onClickWithdraw: () => void;
  onClickSlash: () => void;
}) {
  return (
    <tr>
      <td className="w-8">{sla.id.slice(0, 7)}...</td>
      <td className="w-40">{sla.name}</td>
      <td className="w-80">{sla.description}</td>
      <td className="w-20">{formatUnits(BigInt(sla.stakedAmount), 6)}</td>
      <td className="w-12">{sla.stakingTokenSymbol}</td>
      <td className="w-12">
        <div
          className={clsx("badge py-6", {
            "badge-success": sla.status === "committed",
            "badge-warning":
              sla.status === "bonk-proposed" || sla.status === "bonk-denied",
            "badge-error": sla.status === "bonked",
            "badge-info": sla.status === "withdrawn",
          })}
        >
          {sla.status}
        </div>
      </td>
      <td>
        {isMySLA ? (
          <button
            className="btn btn-secondary btn-xs"
            onClick={onClickWithdraw}
            disabled={
              sla.status === "withdrawal-requested" ||
              sla.status === "withdrawn" ||
              sla.status === "bonk-proposed" ||
              sla.status === "bonked"
            }
          >
            Withdraw
          </button>
        ) : (
          <button
            className="btn btn-secondary btn-xs"
            onClick={onClickSlash}
            disabled={
              sla.status === "bonk-proposed" ||
              sla.status === "bonked" ||
              sla.status === "withdrawal-requested" ||
              sla.status === "withdrawn"
            }
          >
            Bonk
          </button>
        )}
      </td>
    </tr>
  );
}
