"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { capitalizeFirst, cn, formatPhone, formatPrice, getFlagEmoji } from "@/lib/utils";
import { TbCreditCardRefund } from "react-icons/tb";
import { FiPrinter } from "react-icons/fi";
import { OrderGetMany } from "../types";
import { OrderSwitch } from "../components/order-switch";
import Image from "next/image";
import { DiscountSnapshot } from "@/features/customer/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";

interface OrderSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: OrderGetMany[number];
}

export const OrderSheet = ({ open, onOpenChange, data }: OrderSheetProps) => {
    const isRefund = !!data.transactionId && data.status !== "REFUND";
    const discountSnapshot = data.discountSnapshot as DiscountSnapshot;
    const discount = discountSnapshot.discountCoupon;
    const shippingFee = discountSnapshot.shippingFee;
    const subtotal = discountSnapshot.subtotal;
    const savings = discountSnapshot.savings;
    const totalPrice = discountSnapshot.total;

    const queryClient = useQueryClient();

    const refund = useMutation(
        orpc.orders.refund.mutationOptions({
            onSuccess: (data) => {
                toast.success(data.message);
                queryClient.invalidateQueries(orpc.orders.getOne.queryOptions({ input: { storeId: data.storeId, orderCode: data.orderCode } }));
                queryClient.invalidateQueries(orpc.orders.getMany.queryOptions({ input: { storeId: data.storeId } }));
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        <div className="flex items-center gap-x-2">
                            <span className="truncate text-neutral-600">{data.orderCode}</span>
                            {data.country && <span>{getFlagEmoji(data.country)}</span>}
                        </div>
                    </SheetTitle>
                    <SheetDescription>Placed on {format(data.createdAt, "MMMM do, yyyy")}</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Status</span>
                        <Badge variant={data.status}>{capitalizeFirst(data.status as string)}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Action</span>
                        <OrderSwitch status={data.status} orderId={data.id} />
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
                        {data.orderItems.map((item) => {
                            const combination = Object.entries(item.productVariant.combination as Record<string, string>)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ");

                            return (
                                <div key={item.id} className="flex justify-between text-sm gap-2">
                                    <div className="flex gap-2">
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
                                    <div className="flex items-center gap-x-2">
                                        <span className="tracking-tighter font-semibold">{formatPrice(item.finalPrice * item.quantity)}</span>
                                        {item.originalPrice > item.finalPrice && (
                                            <span className="tracking-tighter font-medium text-neutral-600 line-through">
                                                {formatPrice(item.originalPrice * item.quantity)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Coupon</span>
                        <span className="line-clamp-1">{data.coupon?.code || "Not applicable"}</span>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>
                                {formatPrice(subtotal)} <span className="text-xs text-muted-foreground">(saving {formatPrice(savings)})</span>
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Shipping Fee</span>
                            <span>{formatPrice(shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Discount</span>
                            <span>{formatPrice(discount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-sm">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
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
                                <span className="font-semibold">{formatPrice(data.amountPaid)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Difference</span>
                                <span className={cn("font-bold", data.amountPaid - totalPrice !== 0 && "text-rose-600")}>
                                    {data.amountPaid - totalPrice !== 0 && data.amountPaid - totalPrice > 0 ? "+" : "-"}
                                    {formatPrice(Math.abs(data.amountPaid - totalPrice))}
                                </span>
                            </div>
                        </>
                    )}
                    <Button onClick={() => window.print()} className="w-full" variant="outline">
                        <FiPrinter className="size-4" />
                        Print
                    </Button>
                    {isRefund && (
                        <Button onClick={() => refund.mutate({ orderId: data.id })} className="w-full">
                            <TbCreditCardRefund className="size-4" />
                            Refund
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
