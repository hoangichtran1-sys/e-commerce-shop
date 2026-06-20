import { ErrorView } from "@/components/error-view";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { AttributesView } from "@/features/admin/attributes/views/attributes-view";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { storeId } = await params;

    await prefetch(orpc.attributes.getMany.queryOptions({ input: { storeId } }));

    return (
        <HydrateClient>
            <Suspense fallback={<TableSkeleton isSelect={true} cols={4} />}>
                <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <AttributesView storeId={storeId} />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
