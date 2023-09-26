import { useCallback, useEffect, useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

import { useModalHandlers } from "../../../hooks/useModalHandlers";

import { useBonkMutation } from "../hooks/useBonkMutation";
import { SLA } from "./sla-table";

export function BonkModal({
  modalId,
  sla,
  onClose,
}: {
  modalId: string;
  sla: SLA;
  onClose: () => void;
}) {
  const [slashRecipient, setSlashRecipient] = useState("");
  const [slashDetails, setSlashDetails] = useState("");
  const [slashAmount, setSlashAmount] = useState(
    formatUnits(BigInt(sla.stakedAmount), 6)
  );

  const { closeModal } = useModalHandlers(modalId);
  const { address } = useAccount();

  const resetInputs = useCallback(() => {
    setSlashRecipient(address!);
    setSlashDetails("");
    setSlashAmount(formatUnits(BigInt(sla.stakedAmount), 6));
  }, [address, sla.stakedAmount]);

  const {
    mutateAsync: bonk,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useBonkMutation({
    onSuccess: () => {
      resetInputs();
    },
  });

  useEffect(() => {
    if (address) {
      setSlashRecipient(address);
    }
  }, [address]);

  const handleClickBonk = async () => {
    if (address) {
      await bonk({
        stakerId: sla.id,
        details: slashDetails || "0x",
        slashAmount: slashAmount.toString(),
        slashRecipient: slashRecipient,
        stakingTokenSymbol: sla.stakingTokenSymbol,
        stakingTokenAmount: sla.stakedAmount.toString(),
      });
    }
  };

  const isFormValid = slashAmount && slashRecipient;

  return (
    <dialog
      id={modalId}
      className="modal"
      onClose={() => {
        resetInputs();
        onClose();
      }}
    >
      <div className="modal-box">
        <div className="flex flex-row items-center justify-between">
          <h3 className="font-bold text-lg">Bonk</h3>
          <form method="dialog">
            <button className="btn btn-ghost btn-circle p-0">
              <FiX />
            </button>
          </form>
        </div>
        {/* slash amount */}
        <div className="form-control w-full  mb-4">
          <label className="label">
            <span className="label-text">
              How much should be slashed from the staker?
            </span>
          </label>
          <div className="join">
            <input
              type="number"
              step={0.001}
              min={0}
              max={Number(formatUnits(BigInt(sla.stakedAmount), 6))}
              placeholder="Slash amount"
              className="join-item input input-bordered w-full"
              value={slashAmount}
              onChange={(e) => setSlashAmount(e.target.value)}
            />
            <div className="join-item bg-base-200 p-3">
              {sla.stakingTokenSymbol}
            </div>
          </div>
        </div>
        {/* slash recipient */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">
              Who should receive a successful bonk?
            </span>
          </label>
          <div className="join">
            <input
              type="text"
              disabled
              placeholder={address}
              className="join-item input input-bordered w-full"
              value={slashRecipient}
              onChange={(e) => setSlashRecipient(e.target.value)}
            />
          </div>
        </div>
        {/* description */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Optional: Evidence for bonk</span>
          </label>
          <div className="join">
            <textarea
              placeholder="Commitment terms"
              className="join-item textarea textarea-bordered w-full"
              value={slashDetails}
              onChange={(e) => setSlashDetails(e.target.value)}
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
              Bonking...
            </button>
          ) : (
            <button
              className={"btn btn-primary"}
              disabled={!isFormValid}
              onClick={handleClickBonk}
            >
              Bonk
            </button>
          )}
        </div>
        {isSuccess && (
          <div className="alert alert-success mt-8">
            <span>Bonk successfully attempted!</span>
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
