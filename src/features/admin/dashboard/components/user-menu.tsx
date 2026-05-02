"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";
import { CgProfile } from "react-icons/cg";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";

interface UserMenuProps {
    currentUser: User;
}

export const UserMenu = ({ currentUser }: UserMenuProps) => {
    const router = useRouter();

    const onLogout = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Logout successfully");
                    router.refresh();
                },
            },
        });
    };

    return (
        <div className="flex flex-row items-center gap-3">
            <DropdownMenu>
                <DropdownMenuTrigger className="md:p-4 md:py-1 md:px-2 border border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition">
                    {currentUser.image ? (
                        <Avatar>
                            <AvatarImage src={currentUser.image} />
                        </Avatar>
                    ) : (
                        <GeneratedAvatar
                            seed={currentUser.name || currentUser.email}
                        />
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    sideOffset={10}
                    className="w-48 md:w-36 rounded-xl shadow-md bg-white overflow-hidden right-1 top-12 text-sm font-semibold"
                >
                    <DropdownMenuItem className="mt-2" onClick={() => {}}>
                        <CgProfile className="size-5" />
                        My profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="mt-2" onClick={() => {}}>
                        <IoSettingsSharp className="size-5" />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="mt-4" onClick={onLogout}>
                        <LogOutIcon className="size-5" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
