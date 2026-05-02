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

interface CategoriesViewProps {
    storeId: string;
}

export const CategoriesView = ({ storeId }: CategoriesViewProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: categories } = useSuspenseQuery(
        orpc.categories.getMany.queryOptions({ input: { storeId } }),
    );

    const bullDelete = useMutation(
        orpc.billboards.bulkDelete.mutationOptions({
            onSuccess: (data) => {
                toast.success(`${data.count} categories deleted`);
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
        "The following action will permanently remove this categories",
    );

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <Heading
                    title={`Categories (${categories.length})`}
                    description="Manage categories for your store"
                />
                <Button
                    onClick={() =>
                        router.push(`/admin/${storeId}/categories/new`)
                    }
                >
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable
                data={categories}
                columns={columns}
                searchKey="name"
                disabled={bullDelete.isPending}
                onDelete={async (rows) => {
                    const ok = await confirmRemove();
                    if (!ok) return;

                    const ids = rows.map((row) => row.original.id);
                    await bullDelete.mutateAsync({ ids, storeId });
                }}
            />
        </>
    );
};
