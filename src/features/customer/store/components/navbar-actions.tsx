"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { ShoppingBagIcon } from "lucide-react";
import { useCart } from "../../hooks/use-cart";
import { useStoreSlug } from "../../hooks/use-store-slug";
import { useRouter } from "next/navigation";

export const NavbarActions = () => {
    const router = useRouter();
    const storeSlug = useStoreSlug();
    const { totalVariantItems } = useCart(storeSlug);

    return (
        <div className="ml-auto flex items-center gap-x-4">
            <Button onClick={() => router.push(`/${storeSlug}/cart`)} className="flex items-center rounded-full px-4 py-2">
                <ShoppingBagIcon size={20} color="white" />
                <span className="ml-2 text-sm font-medium text-white">{totalVariantItems}</span>
            </Button>
            <UserMenu />
        </div>
    );
};
