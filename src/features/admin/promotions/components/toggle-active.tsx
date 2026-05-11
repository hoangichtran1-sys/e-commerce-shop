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
        orpc.promotions.toggleActive.mutationOptions({
            onSuccess: () => {
                toast.success("Toggle successfully");
                queryClient.invalidateQueries(
                    orpc.promotions.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.promotions.getOne.queryOptions({
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
            aria-label={`Toggle active promotion ${id}`}
        />
    );
};
