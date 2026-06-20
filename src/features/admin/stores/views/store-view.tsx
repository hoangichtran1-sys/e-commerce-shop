"use client";

import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { InfoCard, InfoCardSkeleton } from "../components/info-card";
import { BanknoteIcon, DollarSignIcon, HandCoinsIcon, ShoppingBagIcon, UsersIcon } from "lucide-react";
import { calculatePercentageChange } from "@/lib/utils";
import { RevenueChart, RevenueChartSkeleton, TimePeriod } from "../components/revenue-chart";
import { useState, Suspense } from "react";
import { SalesCategory, SalesCategorySkeleton } from "../components/sales-category";
import { BestSellingProduct, BestSellingProductsSkeleton } from "../components/best-selling-product";
import { ProductLowStock, ProductLowStockSkeleton } from "../components/product-low-stock";
import { OrdersByStatus, OrdersByStatusSkeleton } from "../components/orders-by-status";
import { LIMIT_ORDERS } from "@/constants";
import { RecentOrders, RecentOrdersSkeleton } from "../components/recent-orders";

interface StoreViewProp {
    storeId: string;
}

export const StoreView = ({ storeId }: StoreViewProp) => {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("6_MONTH");

    const { data: overviewData } = useSuspenseQuery(orpc.stores.getOverviewCards.queryOptions({ input: { storeId } }));
    const { data: chartData } = useSuspenseQuery(
        orpc.stores.getRevenueChart.queryOptions({
            input: {
                storeId,
                timePeriod,
            },
        }),
    );

    const { data: categories } = useSuspenseQuery(orpc.categories.getManyParent.queryOptions({ input: { storeId } }));

    const categoriesFormatted = categories.map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const [selectCategory, setSelectCategory] = useState(categoriesFormatted[0].value);

    const { data: categoriesSalesData } = useSuspenseQuery(
        orpc.stores.getSalesByCategory.queryOptions({ input: { storeId, categoryId: selectCategory } }),
    );
    const { data: topSellingProductsData } = useSuspenseQuery(orpc.stores.getTopSellingProducts.queryOptions({ input: { storeId } }));
    const { data: productsLowStockData } = useSuspenseQuery(orpc.stores.getProductsLowStock.queryOptions({ input: { storeId } }));
    const { data: orderByStatusData } = useSuspenseQuery(orpc.stores.getOrderByStatus.queryOptions({ input: { storeId } }));
    const { data: recentOrdersData } = useSuspenseQuery(orpc.orders.getMany.queryOptions({ input: { storeId, limit: LIMIT_ORDERS } }));

    const infoCardOption = [
        {
            icon: DollarSignIcon,
            title: "Gross sales (MTD)",
            previousValue: overviewData.grossSalesPrevious,
            currentValue: overviewData.grossSalesCurrent,
            percentageChange: calculatePercentageChange(overviewData.grossSalesCurrent, overviewData.grossSalesPrevious),
            variant: "currency",
        },
        {
            icon: HandCoinsIcon,
            title: "Total revenue (MTD)",
            previousValue: overviewData.netRevenuePrevious,
            currentValue: overviewData.netRevenueCurrent,
            percentageChange: calculatePercentageChange(overviewData.netRevenueCurrent, overviewData.netRevenuePrevious),
            variant: "currency",
        },
        {
            icon: ShoppingBagIcon,
            title: "Avg Order Value",
            previousValue: overviewData.avgOrderValuePrevious,
            currentValue: overviewData.avgOrderValueCurrent,
            percentageChange: calculatePercentageChange(overviewData.avgOrderValueCurrent, overviewData.avgOrderValuePrevious),
            variant: "currency",
        },

        {
            icon: UsersIcon,
            title: "New customers",
            previousValue: overviewData.newBuyingCustomersCountPrevious,
            currentValue: overviewData.newBuyingCustomersCountCurrent,
            percentageChange: calculatePercentageChange(overviewData.newBuyingCustomersCountCurrent, overviewData.newBuyingCustomersCountPrevious),
            variant: "normal",
        },
        {
            icon: BanknoteIcon,
            title: "Refund value",
            previousValue: overviewData.refundValuePrevious,
            currentValue: overviewData.refundValueCurrent,
            percentageChange: calculatePercentageChange(overviewData.refundValueCurrent, overviewData.refundValuePrevious),
            variant: "currency",
        },
    ];

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading title="Dashboard" description="Overview of your store" />
                <Separator />
                <div className="grid gap-4 md:grid-cols-10 grid-cols-1">
                    <Suspense
                        fallback={Array.from({ length: 5 }).map((_, index) => (
                            <InfoCardSkeleton key={index} />
                        ))}
                    >
                        {infoCardOption.map((item) => (
                            <InfoCard
                                key={item.title}
                                icon={item.icon}
                                title={item.title}
                                previousValue={item.previousValue}
                                currentValue={item.currentValue}
                                percentageChange={item.percentageChange}
                                variant={item.variant as "normal" | "currency"}
                            />
                        ))}
                    </Suspense>
                    <div className="lg:col-span-6 col-span-10 max-w-full">
                        <Suspense fallback={<RevenueChartSkeleton />}>
                            <RevenueChart chartData={chartData} timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
                        </Suspense>
                    </div>
                    <div className="lg:col-span-4 col-span-10 max-w-full">
                        <Suspense fallback={<SalesCategorySkeleton />}>
                            <SalesCategory
                                selectCategory={selectCategory}
                                onSelectCategory={setSelectCategory}
                                categories={categoriesFormatted}
                                categoriesSalesData={categoriesSalesData}
                            />
                        </Suspense>
                    </div>
                    <div className="lg:col-span-3 md:col-span-5 col-span-10 max-w-full">
                        <Suspense fallback={<BestSellingProductsSkeleton />}>
                            <BestSellingProduct data={topSellingProductsData} />
                        </Suspense>
                    </div>
                    <div className="lg:col-span-3 md:col-span-5 col-span-10 max-w-full">
                        <Suspense fallback={<ProductLowStockSkeleton />}>
                            <ProductLowStock data={productsLowStockData} />
                        </Suspense>
                    </div>
                    <div className="lg:col-span-4 col-span-10 max-w-full">
                        <Suspense fallback={<OrdersByStatusSkeleton />}>
                            <OrdersByStatus data={orderByStatusData} />
                        </Suspense>
                    </div>
                    <div className="col-span-10 max-w-full">
                        <Suspense fallback={<RecentOrdersSkeleton />}>
                            <RecentOrders data={recentOrdersData} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};
