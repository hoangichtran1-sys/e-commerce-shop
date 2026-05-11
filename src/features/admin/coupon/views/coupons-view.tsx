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

interface CouponsViewProps {
    storeId: string;
}

export const CouponsView = ({ storeId }: CouponsViewProps) => {
    const router = useRouter();

    const { data: coupons } = useSuspenseQuery(
        orpc.coupons.getMany.queryOptions({ input: { storeId } }),
    );

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Coupons (${coupons.length})`}
                    description="Manage coupons for your store"
                />
                <Button onClick={() => router.push(`/admin/${storeId}/coupons/new`)}>
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable data={coupons} columns={columns} searchKey="code" />
        </>
    );
};
