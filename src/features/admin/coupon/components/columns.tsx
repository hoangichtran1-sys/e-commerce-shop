"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { CouponGetMany } from "../types";
import { CouponActions } from "./coupon-actions";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/hint";

export const columns: ColumnDef<CouponGetMany[number]>[] = [
    {
        accessorKey: "code",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Code
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const code = row.original.code;

            return <p className="line-clamp-1 text-sm font-semibold">{code}</p>;
        },
    },
    {
        accessorKey: "Discount",
        header: () => "Discount",
        cell: ({ row }) => {
            const value = row.original.promotion.value;
            const type = row.original.promotion.type;

            return (
                <div className="flex items-center gap-x-2">
                    {type === "FIXED" && <p className="line-clamp-1">{formatPrice(value)}</p>}
                    {type === "PERCENT" && <p className="line-clamp-1">{value}%</p>}
                </div>
            );
        },
    },
    {
        accessorKey: "Remaining",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Remaining
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const usageLimit = row.original.usageLimit;

            if (!usageLimit) {
                return <Badge variant="outline">Unlimited</Badge>;
            }

            const usedCount = row.original.usedCount;
            const remainingCode = usageLimit - usedCount;

            if (remainingCode === 0) {
                return <Badge variant="secondary">Sold out</Badge>;
            }

            return <Badge variant="default">{remainingCode} codes</Badge>;
        },
    },
    {
        accessorKey: "expired",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Expired
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const end = row.original.promotion.endAt;
            const now = new Date();

            const remainingDays = differenceInDays(end, now);

            let text = "Đang hoạt động";

            if (remainingDays < 3) text = "Sắp kết thúc";
            if (remainingDays <= 0) text = "Đã kết thúc";

            return (
                <Hint text={text}>
                    <div className="text-sm whitespace-nowrap">{remainingDays} days remaining</div>
                </Hint>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Created At
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAtFormatted = format(row.original.createdAt, "MMMM do, yyyy");

            return <p className="line-clamp-1">{createdAtFormatted}</p>;
        },
    },
    {
        accessorKey: "usageLimit",
        header: () => <div className="text-center w-[50%]">Limit</div>,
        cell: ({ row }) => {
            const usageLimit = row.original.usageLimit;

            if (!usageLimit) {
                return <p className="line-clamp-1 text-sm italic text-muted-foreground">Unlimited</p>;
            }

            return (
                <div className="w-[50%]">
                    <p className="line-clamp-1 text-sm font-semibold">{usageLimit}</p>
                </div>
            );
        },
    },
    {
        accessorKey: "perUserLimit",
        header: () => <div className="text-center w-[50%]">User Limit</div>,
        cell: ({ row }) => {
            const perUserLimit = row.original.perUserLimit;

            if (!perUserLimit) {
                return <p className="line-clamp-1 text-sm italic text-muted-foreground">Unlimited</p>;
            }

            return (
                <div className="w-[50%]">
                    <p className="line-clamp-1 text-sm font-semibold">{perUserLimit}</p>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;

            return (
                <CouponActions id={id} storeId={storeId}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for coupon ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </CouponActions>
            );
        },
    },
];
