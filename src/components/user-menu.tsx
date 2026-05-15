"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { ImageUpIcon, LockIcon, LogOutIcon, PackageCheckIcon } from "lucide-react";
import { CgProfile } from "react-icons/cg";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";

export const UserMenu = () => {
    const router = useRouter();

    const session = authClient.useSession();

    const currentUser = session?.data?.user;

    if (!currentUser) {
        return null;
    }

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
                        <GeneratedAvatar seed={currentUser.name || currentUser.email} />
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    sideOffset={10}
                    className="w-64 md:w-48 rounded-xl shadow-md bg-white overflow-hidden right-1 top-12 text-sm font-semibold"
                >
                    {currentUser.role === "admin" && (
                        <DropdownMenuItem className="mt-2" onClick={() => {}}>
                            <ImageUpIcon className="size-5" />
                            Upload manage
                        </DropdownMenuItem>
                    )}
                    {currentUser.role === "admin" && (
                        <DropdownMenuItem className="mt-2" onClick={() => {}}>
                            <LockIcon className="size-5" />
                            Admin manage
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="mt-2" onClick={() => {}}>
                        <PackageCheckIcon className="size-5" />
                        My orders
                    </DropdownMenuItem>
                    <DropdownMenuItem className="mt-2" onClick={() => {}}>
                        <CgProfile className="size-5" />
                        My profile
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
