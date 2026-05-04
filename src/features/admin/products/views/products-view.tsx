"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";

interface ProductsViewProps {
    storeId: string;
}

export const ProductsView = ({ storeId }: ProductsViewProps) => {
    const router = useRouter();

    const { data: products } = useSuspenseQuery(
        orpc.products.getMany.queryOptions({ input: { storeId } }),
    );

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Products (${products.length})`}
                    description="Manage products for your store"
                />
                <Button
                    onClick={() =>
                        router.push(`/admin/${storeId}/products/new`)
                    }
                >
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable data={products} columns={columns} searchKey="name" />
        </>
    );
};
