"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { useEffect, useRef } from "react";

export const SetupView = () => {
    const { onOpen } = useStoreModal();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            onOpen();
            initialized.current = true;
        }
    }, [onOpen]);

    return null;
};
