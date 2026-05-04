"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";

interface OrdersViewProps {
    storeId: string;
}

export const OrdersView = ({ storeId }: OrdersViewProps) => {
    const { data: orders } = useSuspenseQuery(
        orpc.orders.getMany.queryOptions({ input: { storeId } }),
    );

    return (
        <>
            <Heading
                title={`Orders (${orders.length})`}
                description="Manage orders for your store"
            />
            <Separator />
            <DataTable data={orders} columns={columns} searchKey="products" />
        </>
    );
};
