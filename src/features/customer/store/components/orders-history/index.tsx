"use client";

import { Container } from "@/components/container";
import { Heading } from "@/components/heading";
import { NoResults } from "@/components/no-results";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
import { OrderHistoryCard, OrdersSkeleton } from "./order-history-card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaginationOrders } from "@/features/customer/hooks/use-pagination-orders";
import { Pagination } from "@/components/pagination";

interface OrdersHistoryProps {
    storeId: string;
}

export const OrdersHistorySkeleton = () => {
    return (
        <div className="bg-white">
            <Container>
                <div className="flex items-center justify-between m-4">
                    <Heading title="Your Orders" description="Track and manage your recent orders" />
                    <div className="flex flex-col gap-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                </div>
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <OrdersSkeleton />
                </div>
            </Container>
        </div>
    );
};

export const OrdersHistory = ({ storeId }: OrdersHistoryProps) => {
    const [paginationOrders, setPaginationOrders] = usePaginationOrders();

    const { data, isFetching } = useSuspenseQuery(orpc.customer.getOrdersHistory.queryOptions({ input: { storeId, ...paginationOrders } }));

    return (
        <div className="bg-white">
            <Container>
                <div className="flex items-center justify-between m-4">
                    <Heading title="Your Orders" description="Track and manage your recent orders" />
                    <div className="flex flex-col gap-y-2">
                        <span className="text-sm text-muted-foreground">Total Orders: {data.totalCount}</span>
                        {data.totalCount > 0 && (
                            <span className="text-sm text-muted-foreground">Last Order: {format(data.items[0].createdAt, "MMMM do, yyyy")}</span>
                        )}
                    </div>
                </div>
                <Pagination
                    disabled={isFetching}
                    totalPages={data.totalPages}
                    page={data.page}
                    pageSize={data.pageSize}
                    onPageChange={(page) => setPaginationOrders({ page })}
                    onPageSizeChange={(pageSize) => setPaginationOrders({ pageSize })}
                    pageSizeOptions={[5, 10, 20, 50, 100]}
                />
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {data.items.length === 0 && <NoResults icon={PackageIcon} topic="orders" />}
                    {data.items.map((order) => (
                        <OrderHistoryCard key={order.id} data={order} />
                    ))}
                </div>
            </Container>
        </div>
    );
};
