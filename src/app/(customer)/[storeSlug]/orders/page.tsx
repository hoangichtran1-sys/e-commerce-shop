import { ErrorView } from "@/components/error-view";
import { paginationOrdersLoader } from "@/features/customer/params";
import { OrdersHistory, OrdersHistorySkeleton } from "@/features/customer/store/components/orders-history";
import { requireAuth } from "@/lib/auth-utils";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        storeSlug: string;
    }>;
    paginationParams: Promise<SearchParams>;
}

const Page = async ({ params, paginationParams }: PageProps) => {
    await requireAuth();

    const { storeSlug } = await params;
    const paginationOrders = await paginationOrdersLoader(paginationParams);

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    await prefetch(orpc.customer.getOrdersHistory.queryOptions({ input: { storeId: store.id, ...paginationOrders } }));

    return (
        <HydrateClient>
            <Suspense fallback={<OrdersHistorySkeleton />}>
                <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                    <OrdersHistory storeId={store.id} />
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
