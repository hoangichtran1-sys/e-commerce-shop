import { loaderProductsFilterParams, loaderProductsSortParams } from "@/features/customer/params";
import { CategoryView } from "@/features/customer/store/components/category-view";
import { client } from "@/lib/orpc";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { SearchParams } from "nuqs/server";

interface PageProps {
    params: Promise<{
        categorySlug: string;
        storeSlug: string;
    }>;
    searchParams: Promise<SearchParams>;
}

const Page = async ({ params, searchParams }: PageProps) => {
    const sq = await searchParams;
    const { categorySlug, storeSlug } = await params;

    const productsFilter = loaderProductsFilterParams(sq);
    const productsSort = loaderProductsSortParams(sq);

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    const categoryId = await client.customer.getCategoryId({ storeId: store.id, slug: categorySlug });

    const category = await client.customer.getCategory({ categoryId, storeId: store.id });

    await prefetch(orpc.customer.getProducts.queryOptions({ input: { storeId: store.id, categoryId, ...productsFilter, ...productsSort } }));

    return (
        <HydrateClient>
            <CategoryView storeId={store.id} categoryId={categoryId} category={category} />
        </HydrateClient>
    );
};

export default Page;
