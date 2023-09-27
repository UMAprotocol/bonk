import { useCallback, useState } from "react";
import clsx from "clsx";
import { formatUnits } from "viem";

import { shortenHexStr, shortenStr } from "../../../lib/utils/string";

import { BonkModal } from "./bonk-modal";
import { WithdrawModal } from "./withdraw-modal";
import { FinalizeWithdrawModal } from "./finalize-withdraw-modal";
import { DenyBonkModal } from "./deny-bonk-modal";
import { FinalizeBonkModal } from "./finalize-bonk-modal";

export type SLA = {
  id: string;
  name: string;
  description: string;
  stakedAmount: number | bigint;
  stakingTokenSymbol: string;
  finalizationTimestamp?: bigint;
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
            <th>Title</th>
            <th>Description</th>
            <th>Stake amount</th>
            <th>Staking token</th>
            <th>Fin. timestamp</th>
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
              onClickFinalizeWithdraw={() => {
                setSLAToWithdraw(sla);
                setTimeout(() => openModal("finalize-withdraw-modal"), 100);
              }}
              onClickSlash={() => {
                setSLAToBonk(sla);
                setTimeout(() => openModal("bonk-modal"), 100);
              }}
              onClickDenySlash={() => {
                setSLAToBonk(sla);
                setTimeout(() => openModal("deny-bonk-modal"), 100);
              }}
              onClickFinalizeSlash={() => {
                setSLAToBonk(sla);
                setTimeout(() => openModal("finalize-bonk-modal"), 100);
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
      {slaToBonk && (
        <DenyBonkModal
          modalId="deny-bonk-modal"
          sla={slaToBonk!}
          onClose={() => setSLAToBonk(undefined)}
        />
      )}
      {slaToBonk && (
        <FinalizeBonkModal
          modalId="finalize-bonk-modal"
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
      {slaToWithdraw && (
        <FinalizeWithdrawModal
          modalId="finalize-withdraw-modal"
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
  onClickFinalizeWithdraw,
  onClickSlash,
  onClickDenySlash,
  onClickFinalizeSlash,
}: {
  sla: SLA;
  isMySLA: boolean;
  onClickWithdraw: () => void;
  onClickFinalizeWithdraw: () => void;
  onClickSlash: () => void;
  onClickDenySlash: () => void;
  onClickFinalizeSlash: () => void;
}) {
  return (
    <tr>
      <td>
        <div
          className="tooltip tooltip-right before:max-w-xl"
          data-tip={sla.id}
        >
          {shortenHexStr(sla.id)}
        </div>
      </td>
      <td>{sla.name}</td>
      <td>
        <div className=" text-left tooltip" data-tip={sla.description}>
          {shortenStr(sla.description, 100)}
        </div>
      </td>
      <td className="w-20">{formatUnits(BigInt(sla.stakedAmount), 6)}</td>
      <td className="w-12">{sla.stakingTokenSymbol}</td>
      <td className="w-12">
        {sla.finalizationTimestamp
          ? new Date(Number(sla.finalizationTimestamp) * 1000).toLocaleString()
          : "-"}
      </td>
      <td className="w-12">
        <div
          className={clsx("badge py-6", {
            "badge-success": sla.status === "committed",
            "badge-warning":
              sla.status === "bonk-proposed" ||
              sla.status === "bonk-denied" ||
              sla.status === "withdrawal-requested",
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
            onClick={
              getWithdrawalAction(sla) === "finalize-withdrawal"
                ? onClickFinalizeWithdraw
                : onClickWithdraw
            }
            disabled={
              getWithdrawalAction(sla) === "finalize-withdrawal"
                ? false
                : sla.status === "bonk-proposed" ||
                  sla.status === "bonked" ||
                  sla.status === "withdrawal-requested" ||
                  sla.status === "withdrawn" ||
                  sla.status === "bonk-denied"
            }
          >
            {getWithdrawalAction(sla) === "finalize-withdrawal"
              ? "Finalize withdrawal"
              : "Request withdrawal"}
          </button>
        ) : (
          <button
            className="btn btn-secondary btn-xs"
            onClick={
              getBonkAction(sla) === "deny-bonk"
                ? onClickDenySlash
                : getBonkAction(sla) === "finalize-bonk"
                ? onClickFinalizeSlash
                : onClickSlash
            }
            disabled={
              getBonkAction(sla) === "deny-bonk"
                ? false
                : getBonkAction(sla) === "finalize-bonk"
                ? false
                : sla.status === "bonked" ||
                  sla.status === "withdrawal-requested" ||
                  sla.status === "withdrawn" ||
                  sla.status === "bonk-denied"
            }
          >
            {getBonkAction(sla) === "deny-bonk"
              ? "Deny bonk"
              : getBonkAction(sla) === "finalize-bonk"
              ? "Finalize bonk"
              : "Bonk"}
          </button>
        )}
      </td>
    </tr>
  );
}
function getWithdrawalAction(sla: SLA) {
  if (sla.status === "withdrawal-requested") {
    if (
      BigInt(sla.finalizationTimestamp || 0) <
      BigInt(Math.floor(Date.now() / 1000))
    ) {
      return "finalize-withdrawal";
    } else {
      return "withdraw";
    }
  } else {
    return "withdraw";
  }
}

function getBonkAction(sla: SLA) {
  if (sla.status === "bonk-proposed") {
    if (
      BigInt(sla.finalizationTimestamp || 0) >
      BigInt(Math.floor(Date.now() / 1000))
    ) {
      return "deny-bonk";
    } else {
      return "finalize-bonk";
    }
  } else {
    return "bonk";
  }
}
