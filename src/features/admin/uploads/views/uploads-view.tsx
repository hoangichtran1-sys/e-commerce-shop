"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/hooks/use-confirm";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { columns } from "../components/columns";
import { UploadType } from "@/generated/prisma/enums";
import { AppleIcon, DoorOpenIcon, MegaphoneIcon, StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const UploadView = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: images } = useSuspenseQuery(orpc.uploads.getAll.queryOptions());

    const statusOption = [
        { label: "Store", value: UploadType.STORE, icon: StoreIcon },
        { label: "Billboard", value: UploadType.BILLBOARD, icon: MegaphoneIcon },
        { label: "Product", value: UploadType.PRODUCT, icon: AppleIcon },
    ];

    const bulkDelete = useMutation(
        orpc.uploads.bulkDelete.mutationOptions({
            onSuccess: (data) => {
                toast.success(`${data} images deleted`);
                queryClient.invalidateQueries(orpc.uploads.getAll.queryOptions());
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this images");

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between gap-2">
                <Heading title={`Images (${images.length})`} description="Manage images for your all store" />
                <Button onClick={() => router.push("/admin")} size="icon-lg" title="Back to admin" variant="ghost" className="rounded-md">
                    <DoorOpenIcon className="size-6" />
                </Button>
            </div>
            <Separator />
            <DataTable
                data={images}
                columns={columns}
                searchKey="mimetype"
                topic="image"
                statusOption={statusOption}
                disabled={bulkDelete.isPending}
                onDelete={async (rows) => {
                    const ok = await confirmRemove();
                    if (!ok) return;

                    const ids = rows.map((row) => row.original.id);
                    await bulkDelete.mutateAsync({ uploadIds: ids });
                }}
            />
        </>
    );
};
