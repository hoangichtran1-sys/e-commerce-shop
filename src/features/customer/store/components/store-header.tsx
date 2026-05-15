"use client";

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GetStores } from "../../types";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export const StoreHeader = ({ stores, storeName, storeSlug }: { stores: GetStores; storeName: string; storeSlug: string }) => {
    const router = useRouter();
    return (
        <Breadcrumb>
            <BreadcrumbList className="text-xl">
                <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => Cookies.remove("storeSlug")} href="/">
                        Stores
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="hover:text-foreground cursor-pointer">
                            <BreadcrumbEllipsis />
                            <span className="sr-only">Select store</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {stores.map((item) => (
                                <DropdownMenuItem key={item.slug}>
                                    <Link href={`/${item.slug}`}>{item.name}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage onClick={() => router.push(`/${storeSlug}`)}>{storeName}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
};
