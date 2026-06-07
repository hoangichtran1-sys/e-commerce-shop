import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { GetOrdersByStatus } from "../type";
import { BanIcon, ChevronRightIcon, CircleCheckIcon, PackageIcon, PackagePlusIcon, TruckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface OrdersByStatusProps {
    data: GetOrdersByStatus;
}

export const OrdersByStatus = ({ data }: OrdersByStatusProps) => {
    const progressOptions = [
        {
            icon: PackagePlusIcon,
            label: "Paid/Processing",
            percentage: data.percentageProcessing,
            change: data.changeProcessing,
            color: "text-amber-500",
        },
        {
            icon: TruckIcon,
            label: "Shipped",
            percentage: data.percentageShipped,
            change: data.changeShipped,
            color: "text-blue-500",
        },
        {
            icon: CircleCheckIcon,
            label: "Delivered",
            percentage: data.percentageDelivered,
            change: data.changeDelivered,
            color: "text-green-500",
        },
        {
            icon: BanIcon,
            label: "Cancel/Refund",
            percentage: data.percentageClosed,
            change: data.changeClosed,
            color: "text-red-500",
        },
    ];

    return (
        <Card className="min-h-100">
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-2">
                        <Button size="icon-lg" className="rounded-md" variant="outline">
                            <PackageIcon className="size-5 font-semibold text-neutral-500" />
                        </Button>
                        <h3 className="font-medium text-lg">Orders by status</h3>
                    </div>
                </CardTitle>
                <CardDescription>Income {data.thisTotalOrder} orders in the last 30 days</CardDescription>
                <CardAction>
                    <Button onClick={() => {}} title="View All" size="icon-lg" className="rounded-md" variant="outline">
                        <ChevronRightIcon className="size-5 font-semibold text-neutral-500" />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className="mt-2">
                <div className="flex flex-col gap-y-6">
                    {progressOptions.map((item) => (
                        <div key={item.label}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-x-3 mb-2">
                                    <div className="flex items-center gap-x-1">
                                        <item.icon className={`size-4 ${item.color}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.change >= 0 ? (
                                        <Badge variant="outline" className="text-emerald-500">
                                            +{item.change}%
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-rose-500">
                                            -{Math.abs(item.change)}
                                        </Badge>
                                    )}
                                </div>
                                <span>{item.percentage}%</span>
                            </div>
                            <Progress value={item.percentage} className="min-h-3" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
