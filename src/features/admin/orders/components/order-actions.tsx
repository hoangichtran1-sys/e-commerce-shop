import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { OrderGetMany } from "../types";
import { OrderSheet } from "../views/order-sheet";

interface OrderActionProps {
    data: OrderGetMany[number];
    children: React.ReactNode;
}

export const OrderActions = ({ data, children }: OrderActionProps) => {
    const [openOrderSheet, setOpenOrderSheet] = useState(false);

    const onCopy = () => {
        if (data.transactionId) {
            navigator.clipboard.writeText(data.transactionId);
            toast.success("Order transaction ID copied to the clipboard");
        }
        toast.error("Transaction not found");
    };

    return (
        <>
            <OrderSheet open={openOrderSheet} onOpenChange={setOpenOrderSheet} data={data} />
            <div className="flex justify-end">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onCopy} className="font-medium p-2.5">
                            <CopyIcon className="size-4 stroke-2" />
                            Copy transaction ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setOpenOrderSheet(true)}
                            className="font-medium p-2.5"
                        >
                            <ExternalLinkIcon className="size-4 stroke-2" />
                            Order details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
};
