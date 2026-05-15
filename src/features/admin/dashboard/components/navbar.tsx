import { UserMenu } from "@/components/user-menu";
import { MainNav } from "./main-nav";
import { StoreSwitcher } from "./store-switcher";
import Image from "next/image";

export const Navbar = () => {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <Image className="mr-2" height={30} width={30} alt="Logo" src="/logo.svg" />
                <StoreSwitcher />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    <UserMenu />
                </div>
            </div>
        </div>
    );
};
