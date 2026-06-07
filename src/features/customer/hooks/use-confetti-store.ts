import { create } from "zustand";

type UseConfettiStore = {
    isOpenConfetti: boolean;
    onOpenConfetti: () => void;
    onCloseConfetti: () => void;
};

export const useConfettiStore = create<UseConfettiStore>((set) => ({
    isOpenConfetti: false,
    onOpenConfetti: () => set({ isOpenConfetti: true }),
    onCloseConfetti: () => set({ isOpenConfetti: false }),
}));
