import { Container } from "@/components/container";
import { ErrorView } from "@/components/error-view";
import { paginationProductsLoader } from "@/features/customer/params";
import { Billboard } from "@/features/customer/store/components/billboard";
import { ProductFeatured, ProductFeaturedSkeleton } from "@/features/customer/store/components/product-featured";
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
    const { storeSlug } = await params;
    const paginationProducts = await paginationProductsLoader(paginationParams);

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    const billboard = await client.customer.getBillboardGlobal({ storeId: store.id });

    await prefetch(orpc.customer.getProducts.queryOptions({ input: { storeId: store.id, isFeatured: true, ...paginationProducts } }));

    return (
        <Container>
            <div className="space-y-10 pb-10">
                <Billboard data={billboard} />
            </div>
            <HydrateClient>
                <Suspense fallback={<ProductFeaturedSkeleton />}>
                    <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
                            <ProductFeatured storeId={store.id} title="Featured Products" />
                        </div>
                    </ErrorBoundary>
                </Suspense>
            </HydrateClient>
        </Container>
    );
};

export default Page;
