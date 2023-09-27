import { FiX, FiAlertCircle } from "react-icons/fi";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

import { useModalHandlers } from "../../../hooks/useModalHandlers";

import { useFinalizeBonkMutation } from "../hooks/useFinalizeBonkMutation";
import { SLA } from "./sla-table";

export function FinalizeBonkModal({
  modalId,
  sla,
  onClose,
}: {
  modalId: string;
  sla: SLA;
  onClose: () => void;
}) {
  const { closeModal } = useModalHandlers(modalId);
  const { address } = useAccount();

  const {
    mutateAsync: finalizeBonk,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useFinalizeBonkMutation();

  const handleClickBonk = async () => {
    if (address) {
      await finalizeBonk({
        stakerId: sla.id,
      });
    }
  };

  return (
    <dialog
      id={modalId}
      className="modal"
      onClose={() => {
        onClose();
      }}
    >
      <div className="modal-box">
        <div className="flex flex-row items-center justify-between">
          <h3 className="font-bold text-lg">Finalize Bonk</h3>
          <form method="dialog">
            <button className="btn btn-ghost btn-circle p-0">
              <FiX />
            </button>
          </form>
        </div>
        {/* staked amount */}
        <div className="form-control w-full  mb-4">
          <label className="label">
            <span className="label-text">Staked amount</span>
          </label>
          <div className="join">
            <input
              type="number"
              className="join-item input input-bordered w-full"
              value={formatUnits(BigInt(sla.stakedAmount), 6)}
              disabled
            />
            <div className="join-item bg-base-200 p-3">
              {sla.stakingTokenSymbol}
            </div>
          </div>
        </div>
        {/* Finalization */}
        <div className="form-control w-full  mb-4">
          <label className="label">
            <span className="label-text">Finalization timestamp</span>
          </label>
          <div className="join">
            <input
              type="number"
              className="join-item input input-bordered w-full"
              value={String(sla.finalizationTimestamp || 0)}
              disabled
            />
          </div>
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={() => closeModal()}>
            Close
          </button>
          {isLoading ? (
            <button className="btn btn-primary" disabled>
              <span className="loading loading-spinner"></span>
              Finalizing bonk...
            </button>
          ) : (
            <button className={"btn btn-primary"} onClick={handleClickBonk}>
              Finalize bonk
            </button>
          )}
        </div>
        {isSuccess && (
          <div className="alert alert-success mt-8">
            <span>Bonk finalized successfully!</span>
          </div>
        )}
        {isError && (
          <div className="alert alert-error mt-8">
            <FiAlertCircle />
            <span>{String(error)}</span>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
