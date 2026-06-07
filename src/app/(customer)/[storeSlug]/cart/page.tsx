import { ShoppingCart } from "@/features/customer/store/components/shopping-card-view";
import { env } from "@/lib/env";
import { client } from "@/lib/orpc";

interface PageProps {
    params: Promise<{
        storeSlug: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { storeSlug } = await params;

    const store = await client.customer.getStoreBySlug({ slug: storeSlug });
    const shippingFee = env.SHIPPING_FEE;
    const freeThreshold = env.FREE_SHIPPING_THRESHOLD;

    return <ShoppingCart storeId={store.id} storeSlug={storeSlug} shippingFee={shippingFee} freeThreshold={freeThreshold} />;
};

export default Page;
