import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BanIcon, CopyIcon, ExternalLinkIcon, EyeIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { OrderGetMany } from "../types";
import { OrderSheet } from "../views/order-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";

interface OrderActionProps {
    data: OrderGetMany[number];
    children: React.ReactNode;
}

export const OrderActions = ({ data, children }: OrderActionProps) => {
    const [openOrderSheet, setOpenOrderSheet] = useState(false);
    const queryClient = useQueryClient();

    const onCopy = () => {
        if (data.transactionId) {
            navigator.clipboard.writeText(data.transactionId);
            console.log(data.transactionId);
            toast.success("Order transaction ID copied to the clipboard");
            return;
        }
        toast.error("Transaction not found");
    };

    const switchCancel = useMutation(
        orpc.orders.switchStatus.mutationOptions({
            onSuccess: (data) => {
                toast.success("Order status canceled");
                queryClient.invalidateQueries(orpc.orders.getOne.queryOptions({ input: { storeId: data.storeId, orderCode: data.orderCode } }));
                queryClient.invalidateQueries(orpc.orders.getMany.queryOptions({ input: { storeId: data.storeId } }));
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

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
                            onClick={() => {
                                if (data.receiptUrl) {
                                    window.open(data.receiptUrl, "_blank");
                                }
                            }}
                            className="font-medium p-2.5"
                        >
                            <EyeIcon className="size-4 stroke-2" />
                            View invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenOrderSheet(true)} className="font-medium p-2.5">
                            <ExternalLinkIcon className="size-4 stroke-2" />
                            Order details
                        </DropdownMenuItem>
                        {data.status === "PENDING" && (
                            <DropdownMenuItem
                                onClick={() => switchCancel.mutate({ orderId: data.id, status: "CANCELLED" })}
                                className="font-medium p-2.5"
                            >
                                <BanIcon className="size-4 stroke-2" />
                                Cancel order
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
};
