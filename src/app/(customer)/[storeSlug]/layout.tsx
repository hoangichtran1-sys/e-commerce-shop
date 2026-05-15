import { Footer } from "@/features/customer/store/components/footer";
import { Navbar } from "@/features/customer/store/components/navbar";
import { client } from "@/lib/orpc";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        storeSlug: string;
    }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
    const { storeSlug } = await params;

    const store = await client.customer.getStoreBySlug({ slug: storeSlug })

    return (
        <>
            <Navbar storeSlug={store.slug} storeName={store.name} storeId={store.id} />
            {children}
            <Footer storeName={store.name} className="p-8 mt-10 text-center hidden md:block" />
        </>
    );
};

export default Layout;
