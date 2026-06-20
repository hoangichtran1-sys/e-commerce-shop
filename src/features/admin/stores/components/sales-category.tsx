import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { ArrowDownRightIcon, ArrowUpRightIcon, LayoutGridIcon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select";
import { GetSalesByCategory } from "../type";
import { cn, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesCategoryProps {
    categories: { label: string; value: string }[];
    selectCategory: string;
    onSelectCategory: (value: string) => void;
    categoriesSalesData: GetSalesByCategory;
}

const TOP_COUNT = 4;

const colorOptions = ["bg-zinc-900", "bg-zinc-600", "bg-zinc-500", "bg-zinc-400"];

export function SalesCategorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-2">
                        <Button disabled size="icon-lg" className="rounded-md" variant="outline">
                            <LayoutGridIcon className="size-5 font-semibold text-neutral-300" />
                        </Button>
                        <h3 className="font-medium text-lg">Sales by category</h3>
                    </div>
                </CardTitle>
                <CardAction>
                    {/* Giả lập nút Select Trigger đang loading */}
                    <div className="min-w-36 h-9 border border-input bg-background rounded-md flex items-center justify-between px-3 opacity-60">
                        <Skeleton className="h-4 w-16" />
                        <div
                            className="h-4 w-4 border-l border-b border-muted-foreground rotate-[-45deg] translate-y-[-2px] origin-center scale-75"
                            style={{ borderTop: 0, borderRight: 0 }}
                        />
                    </div>
                </CardAction>
            </CardHeader>

            <CardContent>
                {/* Total Revenue Area */}
                <div>
                    <div className="flex items-baseline gap-2">
                        <Skeleton className="h-9 w-32" />
                        <span className="text-sm font-light text-gray-400">MTD gross sales</span>
                    </div>
                </div>

                {/* Multi-color Progress Bar Skeleton */}
                {/* Chia thành 3-4 đoạn với độ rộng cố định để giả lập các phần trăm category khác nhau */}
                <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5 bg-gray-100 mt-2">
                    <div className="h-full bg-zinc-200/60 w-[45%]" />
                    <div className="h-full bg-zinc-200/40 w-[25%]" />
                    <div className="h-full bg-zinc-200/30 w-[15%]" />
                    <div className="h-full bg-zinc-200/20 w-[15%]" />
                </div>

                {/* Badges Legend Skeleton */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium mt-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                            <Skeleton className="h-3.5 w-14" />
                        </div>
                    ))}
                </div>

                {/* TABLE LIST SKELETON */}
                <div className="space-y-4 pt-2 mt-2">
                    {/* Table Header tĩnh */}
                    <div className="flex justify-between text-xs font-light text-neutral-400 px-1">
                        <span>Category</span>
                        <div className="flex gap-8">
                            <span className="w-16 text-right">OrderItems</span>
                            <span className="w-16 text-right">vs prior</span>
                        </div>
                    </div>

                    {/* Loop qua 4 dòng dữ liệu mẫu */}
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between text-sm py-1">
                            {/* Cột trái: ShortName Avatar + Tên Danh mục */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100/50 flex items-center justify-center text-xs font-semibold text-gray-300">
                                    -
                                </div>
                                <Skeleton className="h-4 w-24" />
                            </div>

                            {/* Cột phải: Số lượng đơn + Tỉ lệ thay đổi */}
                            <div className="flex gap-8 items-center">
                                {/* OrderItems Count */}
                                <div className="w-16 flex justify-end">
                                    <Skeleton className="h-4 w-12" />
                                </div>

                                {/* Percentage Change (vs prior) */}
                                <div className="w-16 flex justify-end">
                                    <Skeleton className="h-4 w-10 rounded-sm" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export const SalesCategory = ({ categories, selectCategory, onSelectCategory, categoriesSalesData }: SalesCategoryProps) => {
    const totalRevenue = categoriesSalesData.reduce((sum, item) => sum + item.revenue, 0);

    const sortedCategories = categoriesSalesData.sort((a, b) => b.revenue - a.revenue);

    const topCategories = sortedCategories.slice(0, TOP_COUNT).map((item, index) => ({
        ...item,
        color: colorOptions[index],
    }));
    const otherCategories = sortedCategories.slice(TOP_COUNT);

    if (otherCategories.length > 0) {
        const totalOthersRevenue = otherCategories.reduce((sum, c) => sum + c.revenue, 0);
        const totalOthersOrderItems = otherCategories.reduce((sum, c) => sum + c.orderItems, 0);
        topCategories.push({
            id: "others",
            name: "Others",
            shortName: "O",
            revenue: totalOthersRevenue,
            orderItems: totalOthersOrderItems,
            change: 0,
            color: "bg-zinc-300",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-2">
                        <Button size="icon-lg" className="rounded-md" variant="outline">
                            <LayoutGridIcon className="size-5 font-semibold text-neutral-500" />
                        </Button>
                        <h3 className="font-medium text-lg">Sales by category</h3>
                    </div>
                </CardTitle>
                <CardAction>
                    <Select value={selectCategory} onValueChange={onSelectCategory}>
                        <SelectTrigger className="min-w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            <SelectGroup>
                                <SelectLabel>Category</SelectLabel>
                                {categories.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-gray-900">${formatNumber(totalRevenue)}</span>
                        <span className="text-sm font-light text-gray-700">MTD gross sales</span>
                    </div>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5 bg-gray-100 mt-2">
                    {topCategories.map((item) => {
                        const percentage = (item.revenue / totalRevenue) * 100;
                        return (
                            <div
                                key={item.id}
                                className={`h-full ${item.color} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                                title={`${item.name}: ${percentage.toFixed(1)}%`}
                            />
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-gray-500 mt-2">
                    {topCategories.map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${category.color}`} />
                            <span>{category.name}</span>
                        </div>
                    ))}
                </div>
                {/* TABLE LIST*/}
                <div className="space-y-4 pt-2 mt-2">
                    <div className="flex justify-between text-xs font-light text-neutral-700 px-1">
                        <span>Category</span>
                        <div className="flex gap-8">
                            <span className="w-16 text-right">OrderItems</span>
                            <span className="w-16 text-right">vs prior</span>
                        </div>
                    </div>

                    {topCategories.map((category) => {
                        const isPositive = category.change >= 0;

                        return (
                            <div key={category.id} className="flex items-center justify-between text-sm py-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400">
                                        {category.shortName}
                                    </div>
                                    <span className="font-semibold text-gray-900">{category.name}</span>
                                </div>

                                <div className="flex gap-8 items-center font-medium">
                                    <span className="w-16 text-right text-gray-900">{category.orderItems.toLocaleString()}</span>

                                    <span
                                        className={cn(
                                            "w-16 flex items-center justify-end gap-0.5 text-right font-semibold",
                                            isPositive ? "text-emerald-500" : "text-rose-500",
                                            category.id === "others" && "opacity-0",
                                        )}
                                    >
                                        {isPositive ? <ArrowUpRightIcon className="w-3.5 h-3.5" /> : <ArrowDownRightIcon className="w-3.5 h-3.5" />}
                                        {Math.abs(category.change)}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
