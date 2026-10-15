import { ErrorView } from "@/components/error-view";
import { LIMIT_ORDERS } from "@/constants";
import { loaderStoreFilters } from "@/features/admin/stores/params";
import { StoreView } from "@/features/admin/stores/views/store-view";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        storeId: string;
    }>;
    filterParams: Promise<SearchParams>;
}

const Page = async ({ params, filterParams }: PageProps) => {
    const { storeId } = await params;
    const storeFilters = await loaderStoreFilters(filterParams);

    const categoriesParent = await client.categories.getManyParent({ storeId });

    await prefetch(orpc.stores.getOverviewCards.queryOptions({ input: { storeId } }));

    await prefetch(orpc.stores.getRevenueChart.queryOptions({ input: { storeId, timePeriod: storeFilters.timePeriod } }));

    await prefetch(orpc.stores.getSalesByCategory.queryOptions({ input: { storeId, categoryId: storeFilters.categoryParent } }));

    await prefetch(orpc.stores.getOrderByStatus.queryOptions({ input: { storeId } }));

    await prefetch(orpc.stores.getTopSellingProducts.queryOptions({ input: { storeId } }));

    await prefetch(orpc.stores.getProductsLowStock.queryOptions({ input: { storeId } }));

    await prefetch(orpc.orders.getMany.queryOptions({ input: { storeId, limit: LIMIT_ORDERS } }));

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<ErrorView message="Failed to fetch data" />}>
                <StoreView storeId={storeId} categoriesParent={categoriesParent} />
            </ErrorBoundary>
        </HydrateClient>
    );
};

export default Page;
