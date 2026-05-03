import { ColorForm } from "@/features/admin/colors/views/color-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        colorId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { colorId, storeId } = await params;

    if (colorId !== "new") {
        await prefetch(
            orpc.colors.getOneByID.queryOptions({
                input: { id: colorId, storeId },
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
                            <ColorForm storeId={storeId} colorId={colorId} />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
