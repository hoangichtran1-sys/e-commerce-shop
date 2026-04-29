"use client";

import { StoreModal } from "@/components/modals/store-modal";
import { useMountedState } from "react-use";

export const ModalsProvider = () => {
    const isMounted = useMountedState();

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <StoreModal />
        </>
    )
}