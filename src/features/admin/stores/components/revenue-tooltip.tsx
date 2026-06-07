import { Separator } from "@/components/ui/separator";
import { cn, formatPriceDashboard } from "@/lib/utils";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { calculatePercentageChange } from "@/lib/utils";

interface RevenueTooltipProps {
    active?: boolean;
    payload?: {
        value: ValueType;
        name: NameType;
        dataKey?: string;
    }[];
    label?: string;
}
export const RevenueTooltip = ({ active, payload, label }: RevenueTooltipProps) => {
    if (!active || !payload?.length) {
        return null;
    }

    const grossSales = payload.find((item) => item.dataKey === "grossSales")?.value as number;

    const priorYearSales = payload.find((item) => item.dataKey === "priorYearSales")?.value as number;

    const percentage = calculatePercentageChange(grossSales, priorYearSales);

    return (
        <div className="min-w-55 rounded-xl border bg-background p-4 shadow-lg">
            <div className="mb-3 text-lg font-semibold">{label}</div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-zinc-900" />
                        <span className="text-muted-foreground">Gross sales:</span>
                    </div>

                    <span className="font-semibold">{formatPriceDashboard(grossSales)}</span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-zinc-400" />
                        <span className="text-muted-foreground">Prior year:</span>
                    </div>

                    <span className="font-semibold">{formatPriceDashboard(priorYearSales)}</span>
                </div>
            </div>

            <Separator className="my-3" />

            <div className={cn("font-medium", percentage >= 0 ? "text-green-600" : "text-red-600")}>
                {percentage >= 0 ? "+" : ""}
                {percentage.toFixed(0)}% vs last year
            </div>
        </div>
    );
};
