"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderGetMany } from "../types";
import { OrderActions } from "./order-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { capitalizeFirst, formatPrice } from "@/lib/utils";

export const columns: ColumnDef<OrderGetMany[number]>[] = [
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
        accessorKey: "products",
        header: "Products",
        cell: ({ row }) => {
            const productsName = row.original.orderItems.map(
                (orderItem) => orderItem.product.name,
            );

            if (productsName.length === 0) {
                return (
                    <p className="text-muted-foreground text-xs italic">N/A</p>
                );
            }

            if (productsName.length < 3) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {productsName.map((name, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="whitespace-nowrap"
                            >
                                {name}
                            </Badge>
                        ))}
                    </div>
                );
            }

            const firstProduct = productsName[0];
            const secondProduct = productsName[1];
            const remainingProductsName = productsName.slice(2);

            return (
                <div className="flex items-center gap-x-2">
                    <Badge variant="outline" className="whitespace-nowrap">
                        {firstProduct}
                    </Badge>
                    <Badge variant="outline" className="whitespace-nowrap">
                        {secondProduct}
                    </Badge>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-accent transition-colors"
                            >
                                +{remainingProductsName.length} more
                            </Badge>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-fit min-w-37.5 p-3"
                            align="start"
                        >
                            <div className="flex flex-col gap-y-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                    Other Categories
                                </p>
                                {remainingProductsName.map((name) => (
                                    <div
                                        key={name}
                                        className="text-sm font-medium border-b border-border pb-1 last:border-none"
                                    >
                                        {name}
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            );
        },
    },
    {
        accessorKey: "phone",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Phone
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const phone = row.original.phone;

            return (
                <p className="line-clamp-1">{phone !== "" ? phone : "N/A"}</p>
            );
        },
    },
    {
        accessorKey: "address",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Address
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const address = row.original.address;

            return (
                <p className="line-clamp-1">
                    {address !== "" ? address : "N/A"}
                </p>
            );
        },
    },
    {
        accessorKey: "totalPrice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Total Price
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const totalPrice = row.original.orderItems.reduce(
                (total, item) => total + item.product.price,
                0,
            );

            return <p className="line-clamp-1">{formatPrice(totalPrice)}</p>;
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Status
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const status = row.original.status;

            return (
                <Badge variant={status}>
                    {capitalizeFirst(status as string)}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
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
            const order = row.original;

            return (
                <OrderActions data={order}>
                    <Button className="size-8 p-0" variant="ghost">
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </OrderActions>
            );
        },
    },
];
