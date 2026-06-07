import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { GetRevenueChart } from "../type";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { useMemo } from "react";
import { formatPriceDashboard } from "@/lib/utils";
import { RevenueTooltip } from "./revenue-tooltip";

export type TimePeriod = "1_YEAR" | "6_MONTH";

interface RevenueChartProps {
    chartData: GetRevenueChart;
    timePeriod: TimePeriod;
    setTimePeriod: (timePeriod: TimePeriod) => void;
}

const chartConfig = {
    grossSales: {
        label: "Gross sales",
        color: "#18181B",
    },
    priorYearSales: {
        label: "Prior year",
        color: "#B7B6B7",
    },
} satisfies ChartConfig;

export const RevenueChart = ({ chartData, timePeriod, setTimePeriod }: RevenueChartProps) => {
    const grosSalesInTimePeriod = useMemo(() => {
        if (chartData.length === 0) return 0;

        return chartData.reduce((total, item) => total + item.grossSales, 0);
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{formatPriceDashboard(grosSalesInTimePeriod)}</h2>
                        <div className="flex items-center gap-x-3">
                            <div className="flex items-center gap-x-2">
                                <div className="h-3 w-3 border rounded-full bg-zinc-900" />
                                <span className="text-sm text-muted-foreground">Gross sales</span>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <div className="h-3 w-3 border rounded-full bg-zinc-400" />
                                <span className="text-sm text-muted-foreground">Prior year</span>
                            </div>
                        </div>
                    </div>
                </CardTitle>
                <CardDescription className="text-xs text-neutral-600">
                    Gross sales <span>({timePeriod === "1_YEAR" ? "last year" : "last 6 months"})</span>
                </CardDescription>
                <CardAction className="ml-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="rounded-md" size="icon" variant="ghost">
                                <MoreHorizontalIcon className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-40">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Time Period</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
                                    <DropdownMenuRadioItem value="6_MONTH">Last 6 Months</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="1_YEAR">Last Year</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardAction>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-87.5 w-full">
                    <BarChart accessibilityLayer data={chartData} barGap={12}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            domain={[0, "auto"]}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat("en-US", {
                                    notation: "compact",
                                    compactDisplay: "short",
                                }).format(value)
                            }
                        />
                        <ChartTooltip cursor={false} content={<RevenueTooltip />} />
                        <Bar dataKey="grossSales" fill="var(--color-grossSales)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="priorYearSales" fill="var(--color-priorYearSales)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
