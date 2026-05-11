"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { BookIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";

interface SizesViewProps {
    storeId: string;
}

export const SizesView = ({ storeId }: SizesViewProps) => {
    const router = useRouter();

    const { data: sizes } = useSuspenseQuery(orpc.sizes.getManyByStore.queryOptions({ input: { storeId } }));

    const { data: categories } = useQuery(orpc.categories.getMany.queryOptions({ input: { storeId } }));

    const categoryOption = (categories ?? []).map((item) => ({
        label: item.name,
        value: item.name,
        icon: BookIcon,
    }));

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={`Sizes (${sizes.length})`} description="Manage sizes for your store" />
                <Button onClick={() => router.push(`/admin/${storeId}/sizes/new`)}>
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable categoryOption={categoryOption} data={sizes} columns={columns} searchKey="name" />
        </>
    );
};
