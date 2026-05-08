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
import { capitalizeFirst, formatPrice } from "@/lib/utils";
import { useMemo } from "react";
import { DEFAULT_DISCOUNT } from "@/constants";
import { TbCreditCardRefund } from "react-icons/tb";
import { FiPrinter } from "react-icons/fi";

interface OrderSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: OrderGetMany[number];
}

export const OrderSheet = ({ open, onOpenChange, data }: OrderSheetProps) => {
    const totalPrice = useMemo(() => {
        return data.orderItems.reduce(
            (total, item) => total + item.product.price,
            0,
        );
    }, [data]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>
                        Order{" "}
                        <span className="truncate text-neutral-600">
                            {data.id}
                        </span>
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
                        <h4 className="font-semibold text-sm">
                            Other information
                        </h4>
                        <div className="flex justify-between text-sm">
                            <span>Phone</span>
                            <span>{data.phone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Address</span>
                            <span>{data.address}</span>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-sm">Items</h4>
                        {data.orderItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between text-sm"
                            >
                                <span>{item.product.name} x1</span>
                                <span>{formatPrice(item.product.price)}</span>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Discount</span>
                            <span>{formatPrice(DEFAULT_DISCOUNT)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-sm">
                            <span>Total</span>
                            <span>
                                {formatPrice(totalPrice - DEFAULT_DISCOUNT)}
                            </span>
                        </div>
                    </div>
                    <Button className="w-full">
                        <TbCreditCardRefund className="size-4" />
                        Refund
                    </Button>
                    <Button
                        onClick={() => window.print()}
                        className="w-full"
                        variant="outline"
                    >
                        <FiPrinter className="size-4" />
                        Print
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
