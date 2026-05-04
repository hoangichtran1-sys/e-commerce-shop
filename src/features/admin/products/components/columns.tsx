"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ProductGetMany } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { ProductActions } from "./product-actions";

export const columns: ColumnDef<ProductGetMany[number]>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Name
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const name = row.original.name;

            return <p className="line-clamp-1">{name}</p>;
        },
    },
    {
        accessorKey: "isArchived",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Archived
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const isArchived = row.original.isArchived;

            return (
                <Badge
                    className={cn(
                        "bg-emerald-500",
                        isArchived && "bg-destructive",
                    )}
                >
                    {isArchived ? "Archived" : "Published"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "isFeatured",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Featured
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },

        cell: ({ row }) => {
            const isFeatured = row.original.isFeatured;

            return (
                <Badge
                    className={cn(
                        "bg-slate-500",
                        isFeatured && "bg-emerald-500",
                    )}
                >
                    {isFeatured ? "Featured" : "Normal"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "Price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Price
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const price = row.original.price;

            return <p className="line-clamp-1">{formatPrice(price)}</p>;
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const categoryName = row.original.category.name;

            return <p className="line-clamp-1">{categoryName}</p>;
        },
    },
    {
        accessorKey: "Size",
        header: "Size",
        cell: ({ row }) => {
            const sizeValue = row.original.size.value;

            return <p className="line-clamp-1">{sizeValue}</p>;
        },
    },
    {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => {
            const colorValue = row.original.color.value;

            return (
                <div className="flex items-center gap-x-2">
                    {colorValue}
                    <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: colorValue }}
                    />
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
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Created At
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAtFormatted = format(
                row.original.createdAt,
                "MMMM do, yyyy",
            );

            return <p className="line-clamp-1">{createdAtFormatted}</p>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;

            return (
                <ProductActions id={id} storeId={storeId}>
                    <Button className="size-8 p-0" variant="ghost">
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </ProductActions>
            );
        },
    },
];
