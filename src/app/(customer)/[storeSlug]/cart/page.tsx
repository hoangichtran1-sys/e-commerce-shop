import { ShoppingCart } from "@/features/customer/store/components/shopping-card-view";
import { client } from "@/lib/orpc";

interface PageProps {
    params: Promise<{
        storeSlug: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { storeSlug } = await params;

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });

    return <ShoppingCart storeId={store.id} />;
};

export default Page;
