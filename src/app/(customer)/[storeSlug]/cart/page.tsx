import { ShoppingCart } from "@/features/customer/store/components/shopping-card-view";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { client } from "@/lib/orpc";
import { headers } from "next/headers";

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

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const currentUser = session ? session.user : null;

    return (
        <ShoppingCart storeId={store.id} storeSlug={storeSlug} shippingFee={shippingFee} freeThreshold={freeThreshold} currentUser={currentUser} />
    );
};

export default Page;
