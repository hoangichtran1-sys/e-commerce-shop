import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import React from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";

interface BillboardActionProps {
    id: string;
    storeId: string;
    children: React.ReactNode;
}

export const BillboardActions = ({
    id,
    storeId,
    children,
}: BillboardActionProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const remove = useMutation(
        orpc.billboards.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Billboard deleted");
                queryClient.invalidateQueries(
                    orpc.billboards.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will permanently remove this billboard",
    );

    return (
        <div className="flex justify-end">
            <RemoveConfirmation />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={() =>
                            window.open(
                                `/admin/${storeId}/billboards/${id}`,
                                "_blank",
                            )
                        }
                        className="font-medium p-2.5"
                    >
                        <ExternalLinkIcon className="size-4 stroke-2" />
                        Billboard details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() =>
                            router.push(`/admin/${storeId}/billboards/${id}`)
                        }
                        className="font-medium p-2.5"
                    >
                        <PencilIcon className="size-4 stroke-2" />
                        Edit billboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={async () => {
                            const ok = await confirmRemove();
                            if (!ok) return;

                            await remove.mutateAsync({ id, storeId });
                        }}
                        className="text-destructive focus:text-destructive font-medium p-2.5"
                    >
                        <TrashIcon className="size-4 stroke-2" />
                        Delete billboard
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
