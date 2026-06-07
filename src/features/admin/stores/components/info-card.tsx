import { Skeleton } from "@/components/ui/skeleton";
import { formatPriceDashboard } from "@/lib/utils";
import { ArrowDownRightIcon, ArrowUpRightIcon, LucideIcon } from "lucide-react";

interface InfoCardProps {
    icon: LucideIcon;
    title: string;
    previousValue: number;
    currentValue: number;
    percentageChange: number;
    timeLabel?: string;
    variant: "normal" | "currency";
}

export const InfoCardSkeleton = () => {
    return (
        <div className="border rounded-md flex items-center gap-x-2 p-3">
            <Skeleton className="h-14 w-14 rounded-full mr-2" />
            <div>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-9" />
            </div>
        </div>
    );
};

export const InfoCard = ({ icon: Icon, title, previousValue, currentValue, percentageChange, timeLabel = "last month", variant }: InfoCardProps) => {
    const isPositive = percentageChange > 0;

    return (
        <div className="rounded-2xl lg:col-span-2 md:col-span-5 col-span-10 border border-gray-100 bg-white p-6 shadow-sm max-w-sm">
            <div className="flex items-center gap-2 text-gray-500">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300">
                    <Icon className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <span className="text-[15px] font-medium text-gray-600">{title}</span>
            </div>

            <p className="mt-3 text-[14px] text-gray-400">
                {variant === "currency" ? formatPriceDashboard(previousValue) : previousValue} previous month
            </p>

            <h3 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {variant === "currency" ? formatPriceDashboard(currentValue) : currentValue}
            </h3>

            <div className="mt-4 flex items-center gap-1 text-[14px] font-medium">
                {isPositive ? (
                    <span className="flex items-center gap-0.5 text-emerald-600">
                        <ArrowUpRightIcon className="h-4 w-4 stroke-[2.5]" />+{Math.abs(percentageChange)}%
                    </span>
                ) : (
                    <span className="flex items-center gap-0.5 text-rose-600">
                        <ArrowDownRightIcon className="h-4 w-4 stroke-[2.5]" />-{Math.abs(percentageChange)}%
                    </span>
                )}
                <span className="text-gray-400">vs {timeLabel}</span>
            </div>
        </div>
    );
};
