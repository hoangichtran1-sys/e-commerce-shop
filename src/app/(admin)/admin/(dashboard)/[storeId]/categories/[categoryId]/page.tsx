import { CategoryForm } from "@/features/admin/categories/views/category-form";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        categoryId: string;
        storeId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { categoryId, storeId } = await params;

    if (categoryId !== "new") {
        await prefetch(
            orpc.categories.getOne.queryOptions({
                input: { id: categoryId, storeId },
            }),
        );
    }

    await prefetch(
        orpc.billboards.getManyWithScopeCategory.queryOptions({
            input: { storeId },
        }),
    );

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <div className="flex-col">
                        <div className="flex-1 space-y-4 p-8 pt-6">
                            <CategoryForm
                                storeId={storeId}
                                categoryId={categoryId}
                            />
                        </div>
                    </div>
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    );
};

export default Page;
