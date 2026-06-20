"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { CircleQuestionMarkIcon, ShoppingBagIcon } from "lucide-react";
import { useCart } from "../../hooks/use-cart";
import { useStoreSlug } from "../../hooks/use-store-slug";
import { useRouter } from "next/navigation";

export const NavbarActions = () => {
    const router = useRouter();
    const storeSlug = useStoreSlug();
    const { totalVariantItems } = useCart(storeSlug);

    return (
        <div className="ml-auto flex items-center gap-x-4">
            <Button onClick={() => router.push(`/${storeSlug}/cart`)} title="Shopping cart" className="flex items-center rounded-full px-4 py-2">
                <ShoppingBagIcon size={20} color="white" />
                <span className="ml-2 text-sm font-medium text-white">{totalVariantItems}</span>
            </Button>
            <Button
                onClick={() => {
                    window.open("https://mail.google.com/mail/u/0/?view=cm&fs=1&to=hoangichtran@gmail.com", "_blank");
                }}
                title="Help"
                className="flex items-center rounded-full px-4 py-2"
                variant="ghost"
                size="icon-lg"
            >
                <CircleQuestionMarkIcon className="size-5"/>
            </Button>
            <UserMenu />
        </div>
    );
};
