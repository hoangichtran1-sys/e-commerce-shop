import { Container } from "@/components/container";
import { Billboard } from "@/features/customer/store/components/billboard";
import { ProductFeatured } from "@/features/customer/store/components/product-featured";
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
    const { storeSlug } = await params;

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    const billboard = await client.customer.getBillboardGlobal({ storeId: store.id });

    await prefetch(orpc.customer.getProducts.queryOptions({ input: { storeId: store.id, isFeatured: true } }));

    return (
        <Container>
            <div className="space-y-10 pb-10">
                <Billboard data={billboard} />
            </div>
            <HydrateClient>
                <Suspense fallback={<p>Loading...</p>}>
                    <ErrorBoundary fallback={<p>Error!</p>}>
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
