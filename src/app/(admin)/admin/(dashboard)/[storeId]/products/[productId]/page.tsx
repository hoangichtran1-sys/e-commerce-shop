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
        orpc.categories.getMany.queryOptions({
            input: { storeId },
        }),
    );

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <ProductForm
                                storeId={storeId}
                                productId={productId}
                            />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
