import { CategoryView } from "@/features/customer/store/components/category-view";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        categoryId: string;
        storeSlug: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { categoryId, storeSlug } = await params;

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    await prefetch(orpc.customer.getCategory.queryOptions({ input: { storeId: store.id, categoryId } }));
    await prefetch(orpc.customer.getProducts.queryOptions({ input: { storeId: store.id, categoryId } }));

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <CategoryView storeId={store.id} categoryId={categoryId} />
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
