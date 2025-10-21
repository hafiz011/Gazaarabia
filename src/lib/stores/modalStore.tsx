import { create } from "zustand";

interface ModalStore {
  action: string | null;
  openModal: (action: string) => void;
  clearModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  action: null,
  openModal: (action) => set({ action }),
  clearModal: () => set({ action: null }),
}));
