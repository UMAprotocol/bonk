import { useCallback } from "react";

export function useOpenModal() {
  const openModal = useCallback((modalId: string) => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }, []);

  return openModal;
}
