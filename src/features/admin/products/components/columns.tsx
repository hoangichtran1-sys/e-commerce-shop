"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { ProductGetMany } from "../types";
import { capitalizeFirst, formatPrice } from "@/lib/utils";
import { ProductActions } from "./product-actions";
import { SupportIcon } from "@/components/support-icon";
import { ToggleInStock } from "./toggle-in-stock";
import { Hint } from "@/components/hint";
import { QuantityChange } from "./quantity-change";

export const columns: ColumnDef<ProductGetMany[number]>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const name = row.original.name;
            const sku = row.original.sku;

            return (
                <Hint side="top" text={sku}>
                    <p className="line-clamp-2">{name}</p>
                </Hint>
            );
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Price
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const price = row.original.price;
            const soldCount = row.original.soldCount;

            return (
                <div className="flex flex-col">
                    <p className="line-clamp-1">{formatPrice(price)}</p>
                    <p className="text-muted-foreground">
                        Sold count: <b className="text-foreground">{soldCount}</b>
                    </p>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            const price = row.getValue(id) as number;

            return value.some((range: string) => {
                switch (range) {
                    case "under_50":
                        return price < 50;
                    case "50_100":
                        return price >= 50 && price <= 100;
                    case "100_200":
                        return price >= 100 && price <= 200;
                    case "above_200":
                        return price > 200;
                    default:
                        return false;
                }
            });
        },
    },
    {
        id: "category",
        accessorFn: (row) => row.category.name,
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Category
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const categoryName = row.original.category.name;

            return <p className="line-clamp-1">{categoryName}</p>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "variants",
        header: "Variants",
        cell: ({ row }) => {
            const sizeValue = row.original.size.value;
            const colorValue = row.original.color.value;

            return (
                <div className="flex items-center gap-x-2">
                    <p className="line-clamp-1">{sizeValue}</p>
                    <Hint text={colorValue}>
                        <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: colorValue }} />
                    </Hint>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;

            const statusOption = {
                label: capitalizeFirst(status as string),
                color: "bg-orange-500",
            };

            if (status === "PUBLISHED") {
                statusOption.color = "bg-green-500";
            }
            if (status === "ARCHIVED") {
                statusOption.color = "bg-blue-500";
            }

            return (
                <div className="flex items-center gap-x-2">
                    <div className={`h-2 w-2 rounded-full ${statusOption.color}`} />
                    <span className="text-xs font-medium">{statusOption.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Quantity
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const id = row.original.id;
            const quantity = row.original.quantity;
            const storeId = row.original.storeId;

            if (quantity === 0) {
                return <p className="text-muted-foreground font-light italic">Out of Stock</p>;
            }

            return <QuantityChange storeId={storeId} id={id} initialData={quantity} />;
        },
    },
    {
        accessorKey: "inStock",
        header: "In Stock",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;
            const inStock = row.original.inStock;
            const quantity = row.original.quantity;

            return <ToggleInStock quantity={quantity} isChecked={inStock} id={id} storeId={storeId} />;
        },
    },
    {
        accessorKey: "isFeatured",
        header: () => <div className="text-center w-[50%]">Featured</div>,
        cell: ({ row }) => {
            const isFeatured = row.original.isFeatured;

            return (
                <div className="w-[50%]">
                    <span className="sr-only">{isFeatured ? "Featured" : "Not featured"}</span>
                    <SupportIcon supported={isFeatured} />
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;
            const sku = row.original.sku;

            return (
                <ProductActions id={id} storeId={storeId} sku={sku}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for product ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </ProductActions>
            );
        },
    },
];
