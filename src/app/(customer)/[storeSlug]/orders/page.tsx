import { OrdersHistory } from "@/features/customer/store/components/orders-history";
import { requireAuth } from "@/lib/auth-utils";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        storeSlug: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    await requireAuth();

    const { storeSlug } = await params;

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    await prefetch(orpc.customer.getOrdersHistory.queryOptions({ input: { storeId: store.id } }));

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <OrdersHistory storeId={store.id} />
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
