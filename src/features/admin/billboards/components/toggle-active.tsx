"use client";

import { Switch } from "@/components/ui/switch";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ToggleActiveProps {
    isChecked: boolean;
    id: string;
    storeId: string;
}

export const ToggleActive = ({ id, storeId, isChecked }: ToggleActiveProps) => {
    const queryClient = useQueryClient();

    const toggle = useMutation(
        orpc.billboards.toggleActive.mutationOptions({
            onSuccess: () => {
                toast.error("Toggle successfully");
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
        <Switch
            checked={isChecked}
            onCheckedChange={() => toggle.mutate({ id, storeId })}
            size="sm"
        />
    );
};
