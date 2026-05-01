import { BillboardForm } from "@/features/admin/billboards/views/billboard-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        billboardId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { billboardId, storeId } = await params;

    if (billboardId !== "new") {
        await prefetch(
            orpc.billboards.getOne.queryOptions({
                input: { id: billboardId, storeId },
            }),
        );
    }

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <BillboardForm
                                storeId={storeId}
                                billboardId={billboardId}
                            />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
