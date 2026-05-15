"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { ShoppingBagIcon } from "lucide-react";

export const NavbarActions = () => {
    return (
        <div className="ml-auto flex items-center gap-x-4">
            <Button className="flex items-center rounded-full px-4 py-2">
                <ShoppingBagIcon size={20} color="white" />
                <span className="ml-2 text-sm font-medium text-white">0</span>
            </Button>
            <UserMenu />
        </div>
    )
}