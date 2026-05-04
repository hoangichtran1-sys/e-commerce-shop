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
import { formatPrice } from "@/lib/utils";
import { SupportIcon } from "@/components/support-icon";

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
            const products = row.original.orderItems.map(
                (orderItem) => orderItem.product.name,
            );
            if (products.length === 0) {
                return <p className="line-clamp-1">N/A</p>;
            }

            if (products.length < 3) {
                return (
                    <div className="flex items-center gap-x-2">
                        {products.map((name, index) => (
                            <Badge key={index} variant="secondary">
                                {name}
                            </Badge>
                        ))}
                    </div>
                );
            }

            const productsDisplay = products.slice(0, 1);
            const productsHidden = products.slice(2, products.length - 1);

            return (
                <div className="flex items-center gap-x-2">
                    {productsDisplay.map((name, index) => (
                        <Badge key={index} variant="secondary">
                            {name}
                        </Badge>
                    ))}
                    <Popover>
                        <PopoverTrigger>
                            <Badge variant="outline">
                                +{productsHidden.length}
                            </Badge>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="space-y-2">
                                {productsHidden.map((name, index) => (
                                    <p
                                        key={index}
                                        className="text-sm font-medium"
                                    >
                                        {name}
                                    </p>
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
        accessorKey: "isPaid",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Paid
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const isPaid = row.original.isPaid;

            return <SupportIcon supported={isPaid} />;
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
