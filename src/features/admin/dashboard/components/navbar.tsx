import { User } from "@/lib/auth";
import { UserMenu } from "./user-menu";
import { MainNav } from "./main-nav";
import { StoreSwitcher } from "./store-switcher";

interface NavbarProps {
    currentUser: User;
}

export const Navbar = ({ currentUser }: NavbarProps) => {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <StoreSwitcher />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    <UserMenu currentUser={currentUser} />
                </div>
            </div>
        </div>
    );
};
