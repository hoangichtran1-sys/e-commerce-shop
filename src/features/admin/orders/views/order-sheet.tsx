"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { OrderGetMany } from "../types";
import { format } from "date-fns";
import { capitalizeFirst, cn, formatPhone, formatPrice, getFlagEmoji } from "@/lib/utils";
import { useMemo } from "react";
import { TbCreditCardRefund } from "react-icons/tb";
import { FiPrinter } from "react-icons/fi";

interface OrderSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: OrderGetMany[number];
}

export const OrderSheet = ({ open, onOpenChange, data }: OrderSheetProps) => {
    const totalPrice = useMemo(() => {
        return data.orderItems.reduce((total, item) => total + item.product.price, 0);
    }, [data]);

    const discount = useMemo(() => {
        if (data.coupon) {
            if (data.coupon.promotion.type === "FIXED") {
                return data.coupon.promotion.value;
            } else if (data.coupon.promotion.type === "PERCENT") {
                return totalPrice * data.coupon.promotion.value;
            }
        }

        return 0;
    }, [data, totalPrice]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>
                        Order{" "}
                        <div className="flex items-center gap-x-2">
                            <span className="truncate text-neutral-600">
                                {data.transactionId || "No information"}
                            </span>
                            {data.country && <span>{getFlagEmoji(data.country)}</span>}
                        </div>
                    </SheetTitle>
                    <SheetDescription>
                        Placed on {format(data.createdAt, "MMMM do, yyyy")}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Status</span>
                        <Badge variant={data.status}>
                            {capitalizeFirst(data.status as string)}
                        </Badge>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-sm">Customer Information</h4>
                        <div className="flex justify-between text-sm">
                            <span>Name</span>
                            <span>{data.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Email</span>
                            <span>{data.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Phone</span>
                            <span>{formatPhone(data.phone) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Address</span>
                            <span className="line-clamp-2">{data.address || "N/A"}</span>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-sm">Items</h4>
                        {data.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product.name} x1</span>
                                <span>{formatPrice(item.product.price)}</span>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Coupon</span>
                        <span className="line-clamp-1">
                            {data.coupon?.code || "Not applicable"}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span className={cn(discount > 0 && "line-through text-neutral-500")}>
                                {formatPrice(totalPrice)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Discount</span>
                            <span>{formatPrice(discount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-sm">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice - discount)}</span>
                        </div>
                    </div>
                    {data.amountPaid && (
                        <>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-x-2">
                                    <span className="font-medium text-sm">Amount Paid</span>
                                    <Badge variant="tertiary">Stripe</Badge>
                                </div>
                                <span className="font-semibold">
                                    {formatPrice(data.amountPaid)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Difference</span>
                                <span className="font-bold">
                                    {formatPrice(data.amountPaid - (totalPrice - discount))}
                                </span>
                            </div>
                        </>
                    )}
                    <Button onClick={() => window.print()} className="w-full" variant="outline">
                        <FiPrinter className="size-4" />
                        Print
                    </Button>
                    <Button className="w-full">
                        <TbCreditCardRefund className="size-4" />
                        Refund
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
