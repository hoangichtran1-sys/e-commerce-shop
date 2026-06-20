import { ErrorView } from "@/components/error-view";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";
import { ProductForm } from "@/features/admin/products/views/product-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        productId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { productId, storeId } = await params;

    if (productId !== "new") {
        await prefetch(
            orpc.products.getOne.queryOptions({
                input: { id: productId, storeId },
            }),
        );
    }

    await prefetch(
        orpc.categories.getManyParent.queryOptions({
            input: { storeId },
        }),
    );

    return (
        <HydrateClient>
            <Suspense fallback={<FormSkeleton />}>
                <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <ProductForm storeId={storeId} productId={productId} />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
