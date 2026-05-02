"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PanelLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

interface MainNavProps {
    className?: string;
}

export const MainNav = ({ className }: MainNavProps) => {
    const pathname = usePathname();
    const params = useParams();

    const isMobile = useIsMobile();

    const routes = [
        {
            href: `/admin/${params.storeId}`,
            label: "Overview",
            active: pathname === `/admin/${params.storeId}`,
        },
        {
            href: `/admin/${params.storeId}/billboards`,
            label: "Billboards",
            active: pathname === `/admin/${params.storeId}/billboards`,
        },
        {
            href: `/admin/${params.storeId}/categories`,
            label: "Categories",
            active: pathname === `/admin/${params.storeId}/categories`,
        },
        {
            href: `/admin/${params.storeId}/settings`,
            label: "Settings",
            active: pathname === `/admin/${params.storeId}/settings`,
        },
    ];

    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger className="md:hidden ml-4 pr-4 hover:opacity-75 transition">
                    <PanelLeftIcon className="size-4" />
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-white">
                    <SheetHeader>
                        <div className="flex items-center gap-3">
                            <Image
                                height={30}
                                width={30}
                                alt="Logo"
                                src="/logo.svg"
                            />
                            <SheetTitle>Dashboard CMS</SheetTitle>
                        </div>
                    </SheetHeader>
                    <div className="flex flex-col w-full">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-x-2 text-sm font-medium pl-6 mt-2 transition-color hover:text-black hover:bg-slate-300/20",
                                    route.active
                                        ? "text-black dark:text-white"
                                        : "text-muted-foreground",
                                )}
                            >
                                <div className="flex items-center gap-x-2 py-4">
                                    {route.label}
                                </div>
                                <div
                                    className={cn(
                                        "ml-auto opacity-0 border-2 border-black h-full transition-all",
                                        route.active && "opacity-100",
                                    )}
                                />
                            </Link>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <nav
            className={cn(
                "flex items-center space-x-4 lg:space-x-6",
                className,
            )}
        >
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        route.active
                            ? "text-black dark:text-white"
                            : "text-muted-foreground",
                    )}
                >
                    {route.label}
                </Link>
            ))}
        </nav>
    );
};
