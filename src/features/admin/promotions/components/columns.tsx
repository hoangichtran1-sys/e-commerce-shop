"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { format } from "date-fns";
import { PromotionGetManyByStore } from "../types";
import { PromotionActions } from "./promotion-actions";
import { Badge } from "@/components/ui/badge";
import { capitalizeWords, formatPrice, snakeCaseToTitle } from "@/lib/utils";
import { ToggleActive } from "./toggle-active";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const columns: ColumnDef<PromotionGetManyByStore[number]>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const name = row.original.name;

            return <p className="line-clamp-2">{name}</p>;
        },
    },
    {
        accessorKey: "mode",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mode
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const mode = row.original.mode;

            return (
                <Badge variant={mode}>{capitalizeWords(snakeCaseToTitle(mode as string))}</Badge>
            );
        },
    },
    {
        accessorKey: "type",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Type
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const type = row.original.type;

            return <Badge variant={type}>{capitalizeWords(type as string)}</Badge>;
        },
    },
    {
        accessorKey: "value",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Value
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const value = row.original.value;
            const type = row.original.type;

            return (
                <div className="flex items-center gap-x-2">
                    {type === "FIXED" && <p className="line-clamp-1">{formatPrice(value)}</p>}
                    {type === "PERCENT" && <p className="line-clamp-1">{value}%</p>}
                </div>
            );
        },
    },
    {
        accessorKey: "conditions",
        header: "Condition",
        cell: ({ row }) => {
            const min = row.original.minOrderValue;
            const max = row.original.maxDiscountValue;

            return (
                <div className="flex flex-col text-xs">
                    {min === 0 ? (
                        <p className="line-clamp-1">Unlimited</p>
                    ) : (
                        <span className="text-muted-foreground">
                            Order from: <b className="text-foreground">{formatPrice(min)}</b>
                        </span>
                    )}
                    {max && (
                        <span className="text-muted-foreground">
                            Maximum reduction: <b className="text-foreground">{formatPrice(max)}</b>
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            const end = row.original.endAt;
            const start = row.original.startAt;
            const now = new Date();

            let status = { label: "Inactive", color: "bg-gray-500" };

            if (isActive) {
                status = { label: "Running", color: "bg-green-500" };

                if (now < start) status = { label: "Upcoming", color: "bg-blue-500" };
                if (now > end) status = { label: "Expired", color: "bg-gray-500" };
            }

            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.color}`} />
                        <span className="text-xs font-medium">{status.label}</span>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(start, "dd/MM/yyyy")} - {format(end, "dd/MM/yyyy")}
                    </div>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            const isActive = row.original.isActive;
            const start = row.original.startAt;
            const end = row.original.endAt;
            const now = new Date();
            
            console.log(id)

            let currentStatus = "inactive";

            if (isActive) {
                currentStatus = "running";
                if (now < start) currentStatus = "upcoming";
                if (now > end) currentStatus = "expired";
            }

            return value.includes(currentStatus);
        },
    },
    {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => {
            const mode = row.original.mode;
            let items: string[] = [];

            const categories = row.original.categories.map((category) => category.name);

            const coupons = row.original.coupons.map((coupon) => coupon.code);

            if (mode === "COUPON") {
                items = coupons;
            }

            if (mode === "CATEGORY_CAMPAIGN") {
                items = categories;
            }

            if (items.length === 0) {
                return <Badge variant="ghost">0 Items</Badge>;
            }

            return (
                <div className="flex items-center gap-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-accent transition-colors"
                            >
                                {items.length} {items.length === 1 ? "Item" : "Items"}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="w-fit min-w-37.5 p-3" align="start" side="top">
                            <div className="flex flex-col gap-y-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                    {capitalizeWords(snakeCaseToTitle(mode as string))}
                                </p>
                                {items.map((name) => (
                                    <div key={name} className="text-sm font-medium truncate">
                                        {name}
                                    </div>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
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
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;
            const isActive = row.original.isActive;

            return <ToggleActive isChecked={isActive} id={id} storeId={storeId} />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;

            return (
                <PromotionActions id={id} storeId={storeId}>
                    <Button
                        className="size-8 p-0"
                        variant="ghost"
                        aria-label={`Open actions for promotion ${id}`}
                    >
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </PromotionActions>
            );
        },
    },
];
