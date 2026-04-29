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

    await prefetch(orpc.stores.getOne.queryOptions({ input: { id: storeId } }));

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <div className="">Page: {storeId}</div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
