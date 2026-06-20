import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DiscountSnapshot, GetOrdersHistory } from "@/features/customer/types";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirst, formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { Hint } from "@/components/hint";
import { useState } from "react";
import { TrackOrderModal } from "./track-order-modal";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderHistoryCardProps {
    data: GetOrdersHistory["items"][number];
}

export function OrdersSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(3)].map((_, cardIdx) => (
                <Card key={cardIdx} className="mb-4 animate-pulse">
                    {/* Header Skeleton */}
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-x-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-x-2">
                                <Skeleton className="h-8 w-48" /> {/* Order Code */}
                                <Skeleton className="h-6 w-20 rounded-full" /> {/* Badge Status */}
                            </div>
                            <Skeleton className="h-4 w-36" /> {/* Date Placed */}
                        </div>
                        <div className="space-y-1.5 text-end max-sm:text-start flex flex-col items-end max-sm:items-start">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </CardHeader>

                    {/* Table Content Skeleton */}
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[40%]">
                                        <Skeleton className="h-4 w-12" />
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell text-end">
                                        <Skeleton className="h-4 w-24 ml-auto" />
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-end">
                                        <Skeleton className="h-4 w-16 ml-auto" />
                                    </TableHead>
                                    <TableHead className="text-end">
                                        <Skeleton className="h-4 w-12 ml-auto" />
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(2)].map((_, itemIdx) => (
                                    <TableRow key={itemIdx}>
                                        {/* Item Info */}
                                        <TableCell className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                                            <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-[80%]" />
                                                <Skeleton className="h-3 w-[50%]" />
                                            </div>
                                        </TableCell>
                                        {/* Date */}
                                        <TableCell className="hidden sm:table-cell text-end">
                                            <Skeleton className="h-4 w-24 ml-auto" />
                                        </TableCell>
                                        {/* Quantity */}
                                        <TableCell className="hidden md:table-cell text-end">
                                            <Skeleton className="h-4 w-8 ml-auto" />
                                        </TableCell>
                                        {/* Price */}
                                        <TableCell className="text-end">
                                            <Skeleton className="h-4 w-16 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Footer Buttons Skeleton */}
                    <CardFooter className="flex flex-wrap gap-4 border-t-0 bg-transparent pt-0">
                        <Skeleton className="h-9 w-36" /> {/* View Details */}
                        <Skeleton className="h-9 w-28" /> {/* Track Order */}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

export const OrderHistoryCard = ({ data }: OrderHistoryCardProps) => {
    const discountSnapshot = data.discountSnapshot as DiscountSnapshot;
    const [openTrackModal, setOpenTrackModal] = useState(false);

    return (
        <>
            <TrackOrderModal status={data.status} isOpen={openTrackModal} onClose={() => setOpenTrackModal(false)} updatedAt={data.updatedAt} />
            <Card className="space-y-6">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-x-6">
                    <div>
                        <CardTitle className="flex items-center gap-x-2">
                            <h3 className="text-2xl">Order {data.orderCode}</h3>
                            <Badge variant={data.status}>{capitalizeFirst(data.status)}</Badge>
                        </CardTitle>
                        <CardDescription className="text-balance">Placed on {format(data.createdAt, "MMMM do, yyyy")}</CardDescription>
                    </div>
                    <div className="text-muted-foreground text-end text-sm max-sm:text-start">
                        <p>Total Items: {data._count.orderItems}</p>
                        <p>Shipping fee: {formatPrice(discountSnapshot.shippingFee)}</p>
                        <p>Coupon discount: {formatPrice(discountSnapshot.discountCoupon)}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold">Item</TableHead>
                                <TableHead className="hidden sm:table-cell text-end font-semibold">OrderItem Date</TableHead>
                                <TableHead className="hidden md:table-cell text-end font-semibold">Quantity</TableHead>
                                <TableHead className="text-end font-semibold">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.orderItems.map((item) => {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const attribute = Object.entries(item.productVariant.combination as Record<string, string>).map(([_, val]) => val);
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                                            <Image
                                                width={30}
                                                height={30}
                                                src={item.productVariant.product.images[0].url}
                                                alt={item.productVariant.sku}
                                                className="w-16 h-16 rounded-md object-cover shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{item.productVariant.product.name}</p>
                                                <p className="text-muted-foreground text-sm truncate">
                                                    {attribute.map((attr, index) => {
                                                        if (index === attribute.length - 1) {
                                                            return ` ${attr}`;
                                                        } else {
                                                            return ` ${attr} •`;
                                                        }
                                                    })}
                                                </p>
                                                <p className="text-muted-foreground text-xs sm:hidden mt-1">
                                                    {format(item.createdAt, "MMMM do, yyyy")}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-end">{format(item.createdAt, "MMMM do, yyyy")}</TableCell>
                                        <TableCell className="hidden md:table-cell text-end">{item.quantity}</TableCell>
                                        <TableCell className="text-end">
                                            <span>{formatPrice(item.finalPrice)}</span>
                                            {item.originalPrice > item.finalPrice && (
                                                <span className="text-neutral-600 line-through ml-1">{formatPrice(item.originalPrice)}</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                        <TableFooter className="bg-transparent">
                            {/* Mobile and Tablet Footer - colSpan={2} */}
                            <TableRow className="font-semibold hover:bg-transparent md:hidden">
                                <TableCell colSpan={1}></TableCell>
                                <TableCell className="text-end">{formatPrice(discountSnapshot.total)}</TableCell>
                            </TableRow>
                            {/* Desktop Footer - colSpan={4} */}
                            <TableRow className="font-semibold hover:bg-transparent hidden md:table-row">
                                <TableCell colSpan={3}></TableCell>
                                <TableCell className="text-end">{formatPrice(discountSnapshot.total)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-4 border-t-0 bg-transparent pt-0">
                    <Button
                        onClick={() => {
                            if (data.receiptUrl) {
                                window.open(data.receiptUrl, "_blank");
                                return;
                            }
                            toast.warning("No information");
                        }}
                        variant="default"
                        className="h-9 px-4 py-2"
                    >
                        View Order Details
                    </Button>
                    {data.status !== "PENDING" && data.status !== "CANCELLED" && data.status !== "REFUND" && (
                        <Hint text="Track order">
                            <Button onClick={() => setOpenTrackModal(true)} className="h-9 px-4 py-2" variant="secondary">
                                Track Order
                            </Button>
                        </Hint>
                    )}
                </CardFooter>
            </Card>
        </>
    );
};
