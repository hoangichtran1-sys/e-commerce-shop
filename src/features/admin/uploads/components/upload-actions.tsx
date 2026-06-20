import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CopyIcon, ExternalLinkIcon, TrashIcon } from "lucide-react";
import React from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";

interface UploadActionProps {
    id: string;
    imageUrl: string;
    children: React.ReactNode;
}

export const UploadActions = ({ id, imageUrl, children }: UploadActionProps) => {
    const queryClient = useQueryClient();

    const remove = useMutation(
        orpc.uploads.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Image deleted");
                queryClient.invalidateQueries(orpc.uploads.getAll.queryOptions());
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this image");

    const onCopy = () => {
        navigator.clipboard.writeText(imageUrl);
        toast.success("Image URL copied to the clipboard");
    };

    return (
        <div className="flex justify-end">
            <RemoveConfirmation />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onCopy} className="font-medium p-2.5">
                        <CopyIcon className="size-4 stroke-2" />
                        Copy Image URL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(imageUrl, "_blank")} className="font-medium p-2.5">
                        <ExternalLinkIcon className="size-4 stroke-2" />
                        Preview Image
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={async () => {
                            const ok = await confirmRemove();
                            if (!ok) return;

                            await remove.mutateAsync({ uploadId: id });
                        }}
                        className="text-destructive focus:text-destructive font-medium p-2.5"
                    >
                        <TrashIcon className="size-4 stroke-2" />
                        Delete image
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
