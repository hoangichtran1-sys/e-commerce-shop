"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface QuantityChangeProps {
    initialData: number;
    id: string;
    storeId: string;
}

export const QuantityChange = ({ id, storeId, initialData }: QuantityChangeProps) => {
    const [quantity, setQuantity] = useState(initialData);
    const queryClient = useQueryClient();

    const change = useMutation(
        orpc.products.quantityChange.mutationOptions({
            onSuccess: () => {
                toast.success("Quantity updated");
                queryClient.invalidateQueries(
                    orpc.products.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.products.getOne.queryOptions({
                        input: { storeId, id },
                    }),
                );
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    return (
        <div>
            <Label htmlFor={`${id}-target`} className="sr-only">
                Quantity
            </Label>
            <Input
                type="number"
                min={1}
                step={1}
                className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
                value={quantity}
                onChange={(e) => {
                    setQuantity(Number(e.target.value));
                }}
                id={`${id}-target`}
                onBlur={() => {
                    if (initialData === quantity) return;
                    change.mutate({ id, storeId, quantity });
                }}
                disabled={change.isPending}
            />
        </div>
    );
};
