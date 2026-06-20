"use client";

import { GetPromotionCampaigns } from "@/features/customer/types";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

interface TopPromoBannerProps {
    data: GetPromotionCampaigns;
    storeSlug: string;
}

export const TopPromoBanner = ({ data, storeSlug }: TopPromoBannerProps) => {
    const loops = [1, 2];

    const promoDataFormatted = useMemo(() => {
        return data.map((item) => ({
            id: item.id,
            name: item.name,
            value: item.value,
            duration: `${format(item.startAt, "MMMM do, yyyy")} - ${format(item.endAt, "MMMM do, yyyy")}`,
            url: `/${storeSlug}/categories/${item.categories[0].slug}`,
        }));
    }, [data, storeSlug]);

    return (
        <div className="fixed top-0 left-0 z-50 w-full bg-zinc-900 py-2 text-sm font-bold text-white overflow-hidden hover:[&_div]:paused select-none shadow-md">
            <div className="flex w-max">
                {loops.map((loopIndex) => (
                    <div
                        key={`group-${loopIndex}`}
                        className="flex min-w-full shrink-0 items-center justify-around gap-16 pr-16 animate-marquee"
                        aria-hidden={loopIndex === 2 ? "true" : undefined} // Ẩn nhóm 2 với trình đọc màn hình để tối ưu SEO/Accessibility
                    >
                        {promoDataFormatted.map((promo) => (
                            <Link
                                key={`promo-${loopIndex}-${promo.id}`}
                                href={promo.url}
                                className="whitespace-nowrap transition-transform hover:scale-105 decoration-2"
                            >
                                <div className="flex items-center gap-x-2">
                                    <Badge className=" bg-red-500 hover:bg-red-500">-{promo.value}%</Badge>
                                    <div className="flex flex-col items-start gap-x-1">
                                        <span className="text-sm font-semibold hover:underline">{promo.name}</span>
                                        <span className="text-xs font-medium text-neutral-300">{promo.duration}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
