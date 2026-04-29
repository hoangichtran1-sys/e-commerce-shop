import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";

export const useConfirm = (
    title: string,
    description: string,
): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPromise] = useState<{
        resolve: (value: boolean) => void;
    } | null>(null);
    const confirm = () => {
        return new Promise((resolve) => {
            setPromise({ resolve });
        });
    };
    const handleClose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    const ConfirmationDialog = () => (
        <ResponsiveModal
            open={promise !== null}
            onOpenChange={handleClose}
            title={title}
            description={description}
            isSeparator={false}
        >
            <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full lg:w-auto"
                >
                    Cancel
                </Button>
                <Button onClick={handleConfirm} className="w-full lg:w-auto">
                    Confirm
                </Button>
            </div>
        </ResponsiveModal>
    );

    return [ConfirmationDialog, confirm];
};
