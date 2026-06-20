import { DEFAULT_LIMIT } from "@/constants";
import { loaderReviewsFilterParams } from "@/features/customer/params";
import { ProductView } from "@/features/customer/store/components/product-view";
import { ReviewCursor } from "@/features/customer/types";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetchInfinite } from "@/orpc/orpc-rq.server";
import { headers } from "next/headers";
import { SearchParams } from "nuqs/server";

interface PageProps {
    params: Promise<{
        productId: string;
        storeSlug: string;
    }>;
    searchParams: Promise<SearchParams>;
}

const Page = async ({ params, searchParams }: PageProps) => {
    const { productId, storeSlug } = await params;
    const filters = await loaderReviewsFilterParams(searchParams);

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    const product = await client.customer.getProduct({ storeId: store.id, productId });

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const currentUser = session ? session.user : null;

    await prefetchInfinite(
        orpc.customer.getReviews.infiniteOptions({
            input: (pageParam: ReviewCursor | undefined) => ({
                storeId: store.id,
                productId,
                rating: filters.rating,
                limit: DEFAULT_LIMIT,
                cursor: pageParam,
            }),
            initialPageParam: undefined,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }),
    );

    return (
        <HydrateClient>
            <ProductView currentUser={currentUser} storeId={store.id} shippingFee={env.SHIPPING_FEE} storeSlug={storeSlug} product={product} />
        </HydrateClient>
    );
};

export default Page;
