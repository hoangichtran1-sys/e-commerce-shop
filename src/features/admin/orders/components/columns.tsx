"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { OrderGetMany } from "../types";
import { OrderActions } from "./order-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirst, formatPhone, formatPrice } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Image from "next/image";
import { DiscountSnapshot } from "@/features/customer/types";

export const columns: ColumnDef<OrderGetMany[number]>[] = [
    {
        accessorKey: "orderCode",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Order Code
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const orderCode = row.original.orderCode;
            const totalItem = row.original.orderItems.length;

            return (
                 <div className="flex flex-col gap-y-1">
                     <p className="line-clamp-1 font-semibold">{orderCode}</p>
                     <span className="font-light text-gray-600 text-xs">{totalItem} items</span>
                 </div>
             )
        },
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const name = row.original.name || "No information";
            const email = row.original.email || "No information";
            const address = row.original.address || "No information";

            return (
                <div className="flex flex-col items-start">
                    <p className="text-sm font-semibold">{name || email}</p>
                    <Hint text={address}>
                        <p className="text-xs text-muted-foreground line-clamp-2">{address}</p>
                    </Hint>
                </div>
            );
        },
    },
    {
        accessorKey: "products",
        header: "Products",
        cell: ({ row }) => {
            const items = row.original.orderItems;
            return (
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <Button variant="link" className="h-auto p-0">
                            {items[0]?.productVariant.product.name}

                            {items.length > 1 && <Badge variant="outline">+{items.length - 1} more</Badge>}
                        </Button>
                    </HoverCardTrigger>

                    <HoverCardContent className="w-80 space-y-3">
                        {items.map((item) => {
                            const combination = Object.entries(item.productVariant.combination as Record<string, string>)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ");

                            return (
                                <div key={item.id} className="flex gap-3">
                                    <Image
                                        width={30}
                                        height={30}
                                        alt={item.productVariant.sku}
                                        src={item.productVariant.product.images[0]?.url}
                                        className="h-15 w-15 rounded-md object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.productVariant.product.name}</p>

                                        <p className="text-muted-foreground text-xs">{combination}</p>

                                        <p className="text-xs">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </HoverCardContent>
                </HoverCard>
            );
        },
    },
    {
        accessorKey: "phone",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Phone
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const phone = row.original.phone;

            if (!phone) {
                return <p className="text-muted-foreground">N/A</p>;
            }

            return <p className="line-clamp-1">{formatPhone(phone)}</p>;
        },
    },
    {
        id: "price",
        accessorFn: (row) => {
            const discountSnapshot = row.discountSnapshot as DiscountSnapshot;

            return discountSnapshot.total;
        },
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Total Price
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const discountSnapshot = row.original.discountSnapshot as DiscountSnapshot;
            const totalPrice = discountSnapshot.total;

            const amountPaid = row.original.amountPaid;

            if (!amountPaid || totalPrice === amountPaid) {
                return <p className="line-clamp-1">{formatPrice(totalPrice)}</p>;
            }

            return (
                <div className="flex flex-col items-center">
                    <p className="line-clamp-1 line-through text-muted-foreground">{formatPrice(totalPrice)}</p>
                    <p className="line-clamp-1">{formatPrice(amountPaid)}</p>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            const totalPrice = row.getValue(id) as number;

            return value.some((range: string) => {
                switch (range) {
                    case "under_500":
                        return totalPrice < 500;
                    case "500_1500":
                        return totalPrice >= 500 && totalPrice <= 1500;
                    case "1500_3000":
                        return totalPrice >= 1500 && totalPrice <= 3000;
                    case "3000_5000":
                        return totalPrice >= 3000 && totalPrice <= 5000;
                    case "above_5000":
                        return totalPrice > 5000;
                    default:
                        return false;
                }
            });
        },
    },
    {
        accessorKey: "coupon",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Coupon Code
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const couponCode = row.original.coupon?.code;

            if (!couponCode) {
                return <p className="text-muted-foreground">N/A</p>;
            }

            return <p className="line-clamp-1 font-semibold">{couponCode}</p>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;

            return <Badge variant={status}>{capitalizeFirst(status as string)}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
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
        id: "actions",
        cell: ({ row }) => {
            const order = row.original;

            return (
                <OrderActions data={order}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for order ${order.id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </OrderActions>
            );
        },
    },
];
