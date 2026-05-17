import { ProductView } from "@/features/customer/store/components/product-view";
import { env } from "@/lib/env";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        productId: string;
        storeSlug: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { productId, storeSlug } = await params;

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    await prefetch(orpc.customer.getProduct.queryOptions({ input: { storeId: store.id, productId } }));

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <ProductView storeId={store.id} productId={productId} shippingFee={env.SHIPPING_FEE} />
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
