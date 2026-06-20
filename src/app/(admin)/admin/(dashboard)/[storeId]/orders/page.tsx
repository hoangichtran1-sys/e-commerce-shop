import { ErrorView } from "@/components/error-view";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { OrdersView } from "@/features/admin/orders/views/orders-view";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { storeId } = await params;

    await prefetch(orpc.orders.getMany.queryOptions({ input: { storeId } }));

    return (
        <HydrateClient>
            <Suspense fallback={<TableSkeleton cols={8} />}>
                <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <OrdersView storeId={storeId} />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
