"use client";

import { Container } from "@/components/container";
import { Heading } from "@/components/heading";
import { NoResults } from "@/components/no-results";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
import { OrderHistoryCard } from "./order-history-card";
import { format } from "date-fns";

interface OrdersHistoryProps {
    storeId: string;
}

export const OrdersHistory = ({ storeId }: OrdersHistoryProps) => {
    const { data: orders } = useSuspenseQuery(orpc.customer.getOrdersHistory.queryOptions({ input: { storeId } }));

    return (
        <div className="bg-white">
            <Container>
                <div className="flex items-center justify-between m-4">
                    <Heading title="Your Orders" description="Track and manage your recent orders" />
                    <div className="flex flex-col gap-y-2">
                        <span className="text-sm text-muted-foreground">Total Orders: {orders.length}</span>
                        {orders.length > 0 && (
                            <span className="text-sm text-muted-foreground">Last Order: {format(orders[0].createdAt, "MMMM do, yyyy")}</span>
                        )}
                    </div>
                </div>
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {orders.length === 0 && <NoResults icon={PackageIcon} topic="orders" />}
                    {orders.map((order) => (
                        <OrderHistoryCard key={order.id} data={order} />
                    ))}
                </div>
            </Container>
        </div>
    );
};
