import { useCallback } from "react";

export function useModalHandlers(modalId: string) {
  const openModal = useCallback(() => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }, [modalId]);

  const closeModal = useCallback(() => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  }, [modalId]);

  return { openModal, closeModal };
}
