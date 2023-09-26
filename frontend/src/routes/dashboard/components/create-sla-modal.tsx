import { useCallback, useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";

import { TOKENS } from "../../../lib/constants/tokens";
import { useModalHandlers } from "../../../hooks/useModalHandlers";

import { useCreateSLAMutation } from "../hooks/useCreateSLAMutation";

export function CreateSLAModal({ modalId }: { modalId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stakingAmount, setStakingAmount] = useState(0);
  const [selectedStakingToken, setSelectedStakingToken] = useState("");

  const { closeModal } = useModalHandlers(modalId);

  const resetInputs = useCallback(() => {
    setTitle("");
    setDescription("");
    setSelectedStakingToken("");
    setStakingAmount(0);
  }, []);

  const {
    mutateAsync: createSLA,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useCreateSLAMutation({
    onSuccess: () => {
      resetInputs();
    },
  });

  const handleClickCreate = async () => {
    await createSLA({
      title,
      description,
      stakingAmount,
      selectedStakingToken,
    });
  };

  const isFormValid =
    title && description && stakingAmount && selectedStakingToken;

  return (
    <dialog
      id={modalId}
      className="modal"
      onClose={() => {
        resetInputs();
      }}
    >
      <div className="modal-box">
        <div className="flex flex-row items-center justify-between">
          <h3 className="font-bold text-lg">Create SLA</h3>
          <form method="dialog">
            <button className="btn btn-ghost btn-circle p-0">
              <FiX />
            </button>
          </form>
        </div>
        {/* title */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">What is the title of your SLA?</span>
          </label>
          <div className="join">
            <input
              type="text"
              placeholder="SLA title"
              className="join-item input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        {/* description */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">
              Describe the terms of your commitment.
            </span>
          </label>
          <div className="join">
            <textarea
              placeholder="Commitment terms"
              className="join-item textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        {/* staking token */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">
              How much are you willing to stake?
            </span>
          </label>
          <div className="join">
            <input
              type="number"
              step={0.001}
              min={0}
              placeholder="Staking amount"
              className="join-item input input-bordered w-full"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(Number(e.target.value))}
            />
            <select
              className="select select-bordered join-item bg-base-200"
              onChange={(e) => {
                console.log(e.target.value);
                setSelectedStakingToken(e.target.value);
              }}
              value={selectedStakingToken}
              defaultValue={""}
            >
              <option disabled value={""}>
                Select token
              </option>
              {TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={() => closeModal()}>
            Close
          </button>
          {isLoading ? (
            <button className="btn btn-primary" disabled>
              <span className="loading loading-spinner"></span>
              Creating...
            </button>
          ) : (
            <button
              className={"btn btn-primary"}
              disabled={!isFormValid}
              onClick={handleClickCreate}
            >
              Create
            </button>
          )}
        </div>
        {isSuccess && (
          <div className="alert alert-success mt-8">
            <span>SLA created successfully!</span>
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
