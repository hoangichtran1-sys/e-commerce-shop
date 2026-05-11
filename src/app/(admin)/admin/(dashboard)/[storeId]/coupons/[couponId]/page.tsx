import { CouponForm } from "@/features/admin/coupon/views/coupon-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        couponId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { couponId, storeId } = await params;

    if (couponId !== "new") {
        await prefetch(
            orpc.coupons.getOne.queryOptions({
                input: { id: couponId, storeId },
            }),
        );
    }

    await prefetch(
        orpc.promotions.getManyWithCouponMode.queryOptions({
            input: { storeId },
        }),
    );

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <CouponForm storeId={storeId} couponId={couponId} />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
