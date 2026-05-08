import { PromotionForm } from "@/features/admin/promotions/views/promotion-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        promotionId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { promotionId, storeId } = await params;

    if (promotionId !== "new") {
        await prefetch(
            orpc.promotions.getOne.queryOptions({
                input: { id: promotionId, storeId },
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
                            <PromotionForm
                                storeId={storeId}
                                promotionId={promotionId}
                            />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
