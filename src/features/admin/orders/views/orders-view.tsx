"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { OrderStatus } from "@/generated/prisma/enums";
import { BanIcon, CheckCircle2Icon, LoaderIcon, PackageCheckIcon, TruckIcon } from "lucide-react";
import { TbCreditCardRefund } from "react-icons/tb";

interface OrdersViewProps {
    storeId: string;
}

export const OrdersView = ({ storeId }: OrdersViewProps) => {
    const { data: orders } = useSuspenseQuery(orpc.orders.getMany.queryOptions({ input: { storeId } }));

    const statusOption = [
        {
            label: "Pending",
            value: OrderStatus.PENDING,
            icon: LoaderIcon,
        },
        { label: "Paid", value: OrderStatus.PAID, icon: CheckCircle2Icon },
        {
            label: "Processing",
            value: OrderStatus.PROCESSING,
            icon: LoaderIcon,
        },
        { label: "Shipped", value: OrderStatus.SHIPPED, icon: TruckIcon },
        { label: "Delivered", value: OrderStatus.DELIVERED, icon: PackageCheckIcon },
        { label: "Cancelled", value: OrderStatus.CANCELLED, icon: BanIcon },
        {
            label: "Refund",
            value: OrderStatus.REFUND,
            icon: TbCreditCardRefund,
        },
    ];

    const priceOptions = [
        { label: "Under $500", value: "under_500" },
        { label: "$500 - $1500", value: "500_1500" },
        { label: "$1500 - $3000", value: "1500_3000" },
        { label: "$3000 - $5000", value: "3000_5000" },
        { label: "Above $5000", value: "above_5000" },
    ];

    return (
        <>
            <Heading title={`Orders (${orders.length})`} description="Manage orders for your store" />
            <Separator />
            <DataTable topic="order" priceOption={priceOptions} data={orders} columns={columns} searchKey="products" statusOption={statusOption} />
        </>
    );
};
