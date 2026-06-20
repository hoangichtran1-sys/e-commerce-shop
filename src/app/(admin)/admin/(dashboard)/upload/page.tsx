import { ErrorView } from "@/components/error-view";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { UploadView } from "@/features/admin/uploads/views/uploads-view";
import { requireAdmin } from "@/lib/auth-utils";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
    await requireAdmin();

    await prefetch(orpc.uploads.getAll.queryOptions());

    return (
        <HydrateClient>
            <Suspense fallback={<TableSkeleton cols={6} isSelect={true} />}>
                <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <UploadView />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
