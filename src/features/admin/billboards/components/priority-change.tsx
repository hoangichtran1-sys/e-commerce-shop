"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface PriorityChangeProps {
    initialData: number;
    isGlobal: boolean;
    id: string;
    storeId: string;
}

export const PriorityChange = ({ id, storeId, initialData, isGlobal }: PriorityChangeProps) => {
    const [priority, setPriority] = useState(initialData);
    const queryClient = useQueryClient();

    const change = useMutation(
        orpc.billboards.priorityChange.mutationOptions({
            onSuccess: () => {
                toast.success("Priority updated");
                queryClient.invalidateQueries(
                    orpc.billboards.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.billboards.getOne.queryOptions({
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
                Priority
            </Label>
            <Input
                type="number"
                min={0}
                max={100}
                step={1}
                className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
                value={priority}
                onChange={(e) => {
                    setPriority(Number(e.target.value));
                }}
                id={`${id}-target`}
                onBlur={() => {
                    if (initialData === priority) return;
                    change.mutate({ id, storeId, priority });
                }}
                disabled={!isGlobal || change.isPending}
            />
        </div>
    );
};
