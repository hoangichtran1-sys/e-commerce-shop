"use client";

import { Switch } from "@/components/ui/switch";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ToggleFeaturedProps {
    isChecked: boolean;
    id: string;
    storeId: string;
}

export const ToggleFeatured = ({ id, storeId, isChecked }: ToggleFeaturedProps) => {
    const queryClient = useQueryClient();

    const toggle = useMutation(
        orpc.products.toggleFeatured.mutationOptions({
            onSuccess: () => {
                toast.success("Toggle successfully");
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
        <Switch
            checked={isChecked}
            onCheckedChange={() => toggle.mutate({ id, storeId })}
            size="sm"
            aria-label={`Toggle in featured product ${id}`}
        />
    );
};
