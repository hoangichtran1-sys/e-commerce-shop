import { AttributeForm } from "@/features/admin/attributes/views/attribute-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        attributeId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { attributeId, storeId } = await params;

    if (attributeId !== "new") {
        await prefetch(
            orpc.attributes.getOne.queryOptions({
                input: { id: attributeId, storeId },
            }),
        );
    }

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <AttributeForm storeId={storeId} attributeId={attributeId} />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
