"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { OrderGetMany } from "../types";
import { OrderActions } from "./order-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { capitalizeFirst, formatPhone, formatPrice } from "@/lib/utils";
import { Hint } from "@/components/hint";

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
            const shippingFee = formatPrice(row.original.shippingFee);

            return (
                <Hint text={`Shipping fee: ${shippingFee}`}>
                    <p className="line-clamp-1 font-semibold">{orderCode}</p>
                </Hint>
            );
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
                <div className="flex flex-col items-center">
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
            const productsItem = row.original.orderItems.map((orderItem) => ({ name: orderItem.product.name, quantity: orderItem.quantity }));

            if (productsItem.length === 0) {
                return <p className="text-muted-foreground">N/A</p>;
            }

            if (productsItem.length < 3) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {productsItem.map((p, index) => (
                            <Badge key={index} variant="outline" className="whitespace-nowrap">
                                {p.name} x{p.quantity}
                            </Badge>
                        ))}
                    </div>
                );
            }

            const firstProduct = productsItem[0];
            const secondProduct = productsItem[1];
            const remainingProductsItem = productsItem.slice(2);

            return (
                <div className="flex items-center gap-x-2">
                    <Badge variant="outline" className="whitespace-nowrap">
                        {firstProduct.name} x{firstProduct.quantity}
                    </Badge>
                    <Badge variant="outline" className="whitespace-nowrap">
                        {secondProduct.name} x{firstProduct.quantity}
                    </Badge>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors">
                                +{remainingProductsItem.length} more
                            </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit min-w-37.5 p-3" align="start">
                            <div className="flex flex-col gap-y-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Other Categories</p>
                                {remainingProductsItem.map((p, index) => (
                                    <div key={index} className="text-sm font-medium border-b border-border pb-1 last:border-none">
                                        {p.name} x{p.quantity}
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
            const shippingFee = row.shippingFee;
            let totalPrice = row.orderItems.reduce((total, item) => total + item.product.price, 0) - shippingFee;
            const coupon = row.coupon;

            if (coupon) {
                if (coupon.promotion.type === "FIXED") {
                    totalPrice = totalPrice - coupon.promotion.value;
                } else if (coupon.promotion.type === "PERCENT") {
                    totalPrice = totalPrice - totalPrice * coupon.promotion.value;
                }
            }

            return totalPrice;
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
            const shippingFee = row.original.shippingFee;
            let totalPrice = row.original.orderItems.reduce((total, item) => total + item.product.price, 0) - shippingFee;
            const coupon = row.original.coupon;

            if (coupon) {
                if (coupon.promotion.type === "FIXED") {
                    totalPrice = totalPrice - coupon.promotion.value;
                } else if (coupon.promotion.type === "PERCENT") {
                    totalPrice = totalPrice - totalPrice * coupon.promotion.value;
                }
            }

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
