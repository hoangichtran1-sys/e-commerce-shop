import { SizeForm } from "@/features/admin/sizes/views/size-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        sizeId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { sizeId, storeId } = await params;

    if (sizeId !== "new") {
        await prefetch(
            orpc.sizes.getOneByID.queryOptions({
                input: { id: sizeId, storeId },
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
                            <SizeForm storeId={storeId} sizeId={sizeId} />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
