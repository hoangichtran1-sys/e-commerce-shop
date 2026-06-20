import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { OrderGetMany } from "../../orders/types";
import { ClipboardListIcon, FolderUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { columns } from "../../orders/components/columns";
import { OrderStatus } from "@/generated/prisma/enums";
import { BanIcon, CircleCheckIcon, ClockIcon, PackageIcon, PackageCheckIcon, TruckIcon } from "lucide-react";
import { TbCreditCardRefund } from "react-icons/tb";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface RecentOrdersProps {
    data: OrderGetMany;
}

export const RecentOrdersSkeleton = () => {
    return (
        <div className="max-w-full">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-x-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-16" />
            </div>
            <div className="flex max-w-full flex-col gap-4">
                {Array.from({ length: 9 }).map((_, index1) => (
                    <>
                        <div className="flex gap-20" key={`row-${index1}`}>
                            {Array.from({ length: 8 }).map((_, index2) => (
                                <Skeleton key={`col-${index2}`} className="h-6 w-30" />
                            ))}
                            {index1 !== 0 && <Skeleton className="h-4 w-2 rounded-md" />}
                        </div>
                        {index1 === 0 && <Separator className="mb-2 mt-2" />}
                    </>
                ))}
            </div>
        </div>
    );
};

export const RecentOrders = ({ data }: RecentOrdersProps) => {
    const statusOption = [
        {
            label: "Pending",
            value: OrderStatus.PENDING,
            icon: ClockIcon,
        },
        { label: "Paid", value: OrderStatus.PAID, icon: CircleCheckIcon },
        {
            label: "Processing",
            value: OrderStatus.PROCESSING,
            icon: PackageIcon,
        },
        { label: "Shipped", value: OrderStatus.SHIPPED, icon: TruckIcon },
        { label: "Delivered", value: OrderStatus.DELIVERED, icon: PackageCheckIcon },
        { label: "Cancelled", value: OrderStatus.CANCELLED, icon: BanIcon },
        {
            label: "Refund",
            value: OrderStatus.REFUND,
            icon: TbCreditCardRefund,
        },
    ];

    const priceOptions = [
        { label: "Under $500", value: "under_500" },
        { label: "$500 - $1500", value: "500_1500" },
        { label: "$1500 - $3000", value: "1500_3000" },
        { label: "$3000 - $5000", value: "3000_5000" },
        { label: "Above $5000", value: "above_5000" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-x-2">
                        <Button size="icon-lg" variant="outline" className="rounded-md">
                            <ClipboardListIcon className="size-5 font-semibold text-neutral-500" />
                        </Button>
                        <h3 className="font-medium text-lg">Recent Orders</h3>
                        <Badge className="px-2" variant="outline">
                            {data.length}
                        </Badge>
                    </div>
                </CardTitle>
                <CardAction>
                    <Button onClick={() => {}} title="Export data" size="sm" className="rounded-md p-4" variant="outline">
                        <FolderUpIcon className="size-5 font-semibold text-neutral-500 mr-2" />
                        Export
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <DataTable topic="order" data={data} columns={columns} priceOption={priceOptions} statusOption={statusOption} searchKey="products" />
            </CardContent>
        </Card>
    );
};
