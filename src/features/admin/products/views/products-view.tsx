"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { BookCheckIcon, BookIcon, FlameIcon, PackageIcon, PlusIcon, ScissorsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";
import { ProductStatus } from "@/generated/prisma/enums";
import { toast } from "sonner";

interface ProductsViewProps {
    storeId: string;
}

export const ProductsView = ({ storeId }: ProductsViewProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: products } = useSuspenseQuery(orpc.products.getMany.queryOptions({ input: { storeId } }));

    const { data: categories } = useQuery(orpc.categories.getManyParent.queryOptions({ input: { storeId } }));

    const categoryOption = (categories ?? []).map((item) => ({
        label: item.name,
        value: item.name,
        icon: BookIcon,
    }));

    const statusOption = [
        { label: "Draft", value: ProductStatus.DRAFT, icon: ScissorsIcon },
        { label: "Published", value: ProductStatus.PUBLISHED, icon: BookCheckIcon },
        { label: "Archived", value: ProductStatus.ARCHIVED, icon: PackageIcon },
    ];

    const productIds = products.map((p) => p.id);

    const checkTrending = useMutation(
        orpc.products.checkTrending.mutationOptions({
            onSuccess: () => {
                toast.success("Check all products successfully");
                queryClient.invalidateQueries(orpc.products.getMany.queryOptions({ input: { storeId } }));
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={`Products (${products.length})`} description="Manage products for your store" />
                <div className="flex items-center gap-x-2">
                    <Button onClick={() => router.push(`/admin/${storeId}/products/new`)}>
                        <PlusIcon className="size-4" />
                        Add New
                    </Button>
                    <Button variant="outline" onClick={() => checkTrending.mutate({ storeId, productIds })}>
                        <FlameIcon className="size-4" />
                        Check Treding
                    </Button>
                </div>
            </div>
            <Separator />
            <DataTable
                statusOption={statusOption}
                categoryOption={categoryOption}
                data={products}
                columns={columns}
                searchKey="name"
                topic="product"
            />
        </>
    );
};
