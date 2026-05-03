"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/hooks/use-confirm";
import { orpc } from "@/orpc/orpc-rq.client";
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { columns } from "../components/columns";

interface BillboardViewProps {
    storeId: string;
}

export const BillboardView = ({ storeId }: BillboardViewProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: billboards } = useSuspenseQuery(
        orpc.billboards.getMany.queryOptions({ input: { storeId } }),
    );

    const bulkDelete = useMutation(
        orpc.billboards.bulkDelete.mutationOptions({
            onSuccess: (data) => {
                toast.success(`${data.count} billboards deleted`);
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
        "The following action will permanently remove this billboards",
    );

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <Heading
                    title={`Billboards (${billboards.length})`}
                    description="Manage billboards for your store"
                />
                <Button
                    onClick={() =>
                        router.push(`/admin/${storeId}/billboards/new`)
                    }
                >
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable
                data={billboards}
                columns={columns}
                searchKey="label"
                disabled={bulkDelete.isPending}
                onDelete={async (rows) => {
                    const ok = await confirmRemove();
                    if (!ok) return;

                    const ids = rows.map((row) => row.original.id);
                    await bulkDelete.mutateAsync({ ids, storeId });
                }}
            />
        </>
    );
};
