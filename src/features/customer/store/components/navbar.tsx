import { Container } from "@/components/container";
import { MainNav } from "./main-nav";
import { client } from "@/lib/orpc";
import { StoreHeader } from "./store-header";
import { NavbarActions } from "./navbar-actions";

interface NavbarProps {
    storeName: string;
    storeSlug: string;
    storeId: string;
}

export const Navbar = async ({ storeName, storeId, storeSlug }: NavbarProps) => {
    const categories = await client.customer.getCategoriesInStore({ storeId });
    const stores = await client.customer.getStores();

    return (
        <div className="border-b">
            <Container>
                <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                    <div className="ml-4 flex lg:ml-0 gap-x-2 font-bold">
                        <StoreHeader storeSlug={storeSlug} storeName={storeName} stores={stores} />
                    </div>
                    <MainNav data={categories} />
                    <NavbarActions />
                </div>
            </Container>
        </div>
    );
};
