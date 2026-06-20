import { ErrorView } from "@/components/error-view";
import { LIMIT_ORDERS } from "@/constants";
import { StoreView } from "@/features/admin/stores/views/store-view";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { storeId } = await params;

    const categoriesParent = await client.categories.getManyParent({ storeId });

    await prefetch(orpc.stores.getOverviewCards.queryOptions({ input: { storeId } }));

    // TODO: use nuqs params
    await prefetch(orpc.stores.getRevenueChart.queryOptions({ input: { storeId, timePeriod: "6_MONTH" } }));

    await prefetch(
        orpc.categories.getManyParent.queryOptions({
            input: { storeId },
        }),
    );

    // TODO: use nuqs params
    await prefetch(orpc.stores.getSalesByCategory.queryOptions({ input: { storeId, categoryId: categoriesParent[0].id } }));

    await prefetch(orpc.stores.getOrderByStatus.queryOptions({ input: { storeId } }));

    await prefetch(orpc.stores.getTopSellingProducts.queryOptions({ input: { storeId } }));

    await prefetch(orpc.stores.getProductsLowStock.queryOptions({ input: { storeId } }));

    await prefetch(orpc.orders.getMany.queryOptions({ input: { storeId, limit: LIMIT_ORDERS } }));

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                <StoreView storeId={storeId} />
            </ErrorBoundary>
        </HydrateClient>
    );
};

export default Page;
