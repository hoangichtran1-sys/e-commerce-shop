import { create } from "zustand";

type useOrderSheetState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useOrderSheet = create<useOrderSheetState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
