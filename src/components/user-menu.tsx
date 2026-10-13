"use client";

import { useMountedState } from "react-use";
import { useTheme } from "next-themes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { ImageUpIcon, LockIcon, LogOutIcon, Moon, PackageCheckIcon, Sun } from "lucide-react";
import { CgProfile } from "react-icons/cg";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";
import { Skeleton } from "./ui/skeleton";

export const UserMenu = () => {
    const { setTheme } = useTheme();
    const isMounted = useMountedState();
    const router = useRouter();
    const storeSlug = useStoreSlug();

    if (!isMounted) {
        return <Skeleton className="h-12 w-12 rounded-full" />;
    }

    const session = authClient.useSession();

    const currentUser = session?.data?.user;

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
    if (!currentUser) {
        return <Skeleton className="h-12 w-12 rounded-full" />;
    }

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
                        <DropdownMenuItem className="mt-2" onClick={() => router.push("/admin/upload")}>
                            <ImageUpIcon className="size-5" />
                            Upload manage
                        </DropdownMenuItem>
                    )}
                    {currentUser.role === "admin" && (
                        <DropdownMenuItem className="mt-2" onClick={() => router.push("/admin")}>
                            <LockIcon className="size-5" />
                            Admin manage
                        </DropdownMenuItem>
                    )}
                    {!!storeSlug && (
                        <DropdownMenuItem className="mt-2" onClick={() => router.push(`/${storeSlug}/orders`)}>
                            <PackageCheckIcon className="size-5" />
                            My orders
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="mt-2" onClick={() => {}}>
                        <CgProfile className="size-5" />
                        My profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <div className="flex items-center gap-2">
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                <span>Toggle theme</span>
                            </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem className="mt-4" onClick={onLogout}>
                        <LogOutIcon className="size-5" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
