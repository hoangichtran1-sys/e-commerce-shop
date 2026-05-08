import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CopyIcon,
    PencilIcon,
    TrashIcon,
} from "lucide-react";
import React from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";

interface CategoryActionProps {
    id: string;
    storeId: string;
    children: React.ReactNode;
}

export const CategoryActions = ({
    id,
    storeId,
    children,
}: CategoryActionProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const remove = useMutation(
        orpc.categories.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Category deleted");
                queryClient.invalidateQueries(
                    orpc.categories.getManyWithPromotion.queryOptions({
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
        "The following action will permanently remove this category",
    );

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toast.success("Category ID copied to the clipboard");
    };

    return (
        <div className="flex justify-end">
            <RemoveConfirmation />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={onCopy}
                        className="font-medium p-2.5"
                    >
                        <CopyIcon className="size-4 stroke-2" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            router.push(`/admin/${storeId}/categories/${id}`)
                        }
                        className="font-medium p-2.5"
                    >
                        <PencilIcon className="size-4 stroke-2" />
                        Edit category
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
                        Delete category
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
