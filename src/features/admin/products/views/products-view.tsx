"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { BookCheckIcon, BookIcon, PackageIcon, PlusIcon, ScissorsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";
import { ProductStatus } from "@/generated/prisma/enums";

interface ProductsViewProps {
    storeId: string;
}

export const ProductsView = ({ storeId }: ProductsViewProps) => {
    const router = useRouter();

    const { data: products } = useSuspenseQuery(orpc.products.getMany.queryOptions({ input: { storeId } }));

    const { data: categories } = useQuery(orpc.categories.getMany.queryOptions({ input: { storeId } }));

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

    const priceOptions = [
        { label: "Under $50", value: "under_50" },
        { label: "$50 - $100", value: "50_100" },
        { label: "$100 - $200", value: "100_200" },
        { label: "Above $200", value: "above_200" },
    ];

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={`Products (${products.length})`} description="Manage products for your store" />
                <Button onClick={() => router.push(`/admin/${storeId}/products/new`)}>
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable
                priceOption={priceOptions}
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
