import { create } from "zustand";

type useReviewModalState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useReviewModal = create<useReviewModalState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
