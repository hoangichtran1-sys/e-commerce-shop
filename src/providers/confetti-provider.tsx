"use client";

import { useConfettiStore } from "@/features/customer/hooks/use-confetti-store";
import ReactConfetti from "react-confetti";

export const ConfettiProvider = () => {
    const { isOpenConfetti, onCloseConfetti } = useConfettiStore();

    if (!isOpenConfetti) return null;

    return <ReactConfetti className="pointer-events-none z-100" numberOfPieces={500} recycle={false} onConfettiComplete={() => onCloseConfetti()} />;
};
