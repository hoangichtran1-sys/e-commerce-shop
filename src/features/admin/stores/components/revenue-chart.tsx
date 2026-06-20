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
import { Skeleton } from "@/components/ui/skeleton";

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

export function RevenueChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center justify-between gap-3">
                        {/* Skeleton cho tổng số tiền doanh thu (Text lớn bên trái) */}
                        <Skeleton className="h-8 w-36" />

                        {/* Giữ nguyên cụm Legend (Gross sales / Prior year) tĩnh để định hình UI */}
                        <div className="flex items-center gap-x-3">
                            <div className="flex items-center gap-x-2">
                                <div className="h-3 w-3 border rounded-full bg-zinc-950/20" />
                                <span className="text-sm text-muted-foreground/60">Gross sales</span>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <div className="h-3 w-3 border rounded-full bg-zinc-400/20" />
                                <span className="text-sm text-muted-foreground/60">Prior year</span>
                            </div>
                        </div>
                    </div>
                </CardTitle>

                {/* Phần mô tả nhãn thời gian */}
                <CardDescription className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                    <span>Gross sales (</span>
                    <Skeleton className="h-3.5 w-16" />
                    <span>)</span>
                </CardDescription>

                <CardAction className="ml-2">
                    <Button disabled className="rounded-md" size="icon" variant="ghost">
                        <MoreHorizontalIcon className="size-4 text-neutral-300" />
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent>
                {/* Giả lập khung ChartContainer gốc với chiều cao min-h-87.5 */}
                <div className="min-h-87.5 w-full flex flex-col justify-end pt-6">
                    {/* Khu vực giả lập các cột biểu đồ (Bars) */}
                    <div className="flex items-end justify-between gap-4 px-2 h-48 w-full border-b border-zinc-100">
                        {/* Loop tạo 6 cụm cột đại diện cho 6 tháng (Mỗi cụm có 2 cột: hiện tại và năm trước) */}
                        {Array.from({ length: 6 }).map((_, i) => {
                            // Tạo độ cao ngẫu nhiên một chút cho tự nhiên, hoặc fix cứng tùy bạn
                            const heights = [
                                { current: "h-[60%]", prior: "h-[45%]" },
                                { current: "h-[85%]", prior: "h-[70%]" },
                                { current: "h-[40%]", prior: "h-[55%]" },
                                { current: "h-[75%]", prior: "h-[60%]" },
                                { current: "h-[90%]", prior: "h-[80%]" },
                                { current: "h-[65%]", prior: "h-[50%]" },
                            ];

                            return (
                                <div key={i} className="flex items-end gap-2 flex-1 justify-center max-w-[60px]">
                                    {/* Cột đại diện Gross Sales (Màu đậm hơn chút) */}
                                    <Skeleton className={`w-4 ${heights[i].current} rounded-t-[4px] bg-neutral-200`} />
                                    {/* Cột đại diện Prior Year (Màu nhạt hơn) */}
                                    <Skeleton className={`w-4 ${heights[i].prior} rounded-t-[4px] bg-neutral-100`} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Giả lập XAxis (Dòng chữ tháng dưới chân biểu đồ) */}
                    <div className="flex justify-between gap-4 px-2 pt-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex justify-center flex-1 max-w-[60px]">
                                <Skeleton className="h-3.5 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

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
