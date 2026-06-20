"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/orpc-rq.client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { HeartIcon, StarIcon } from "lucide-react";
import Image from "next/image";

interface ProductsRelatedProps {
    storeId: string;
    categoryIds: string[];
    productCurrentIds: string[];
}

export function ProductsRelatedSkeleton() {
    return (
        <>
            {/* Loop ra 4 card để lấp đầy 1 hàng ngang trên màn hình Desktop (lg:grid-cols-4) */}
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden shadow-none pointer-events-none">
                    <CardContent className="flex flex-col gap-4 p-6">
                        {/* IMAGE SKELETON (Giữ đúng tỉ lệ vuông aspect-square) */}
                        <div className="overflow-hidden rounded-md w-full aspect-square">
                            <Skeleton className="h-full w-full" />
                        </div>

                        {/* INFO CONTENT */}
                        <div className="flex flex-col gap-2">
                            {/* Product Name */}
                            <Skeleton className="h-6 w-3/4" />

                            {/* RATING & FAVORITE AREA */}
                            <div className="flex items-center gap-1 h-5">
                                {/* Giả lập 5 ngôi sao bằng một thanh skeleton dài ngang cho gọn hoặc 5 ô vuông nhỏ */}
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="size-4 rounded-sm" />
                                    ))}
                                </div>
                                {/* Số rating (X.X) */}
                                <Skeleton className="h-4 w-6 ml-1" />

                                <Separator orientation="vertical" className="h-3" />

                                {/* Favorite Area (Số tim) */}
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="size-3 rounded-full" />
                                </div>
                            </div>

                            {/* PRICE SKELETON */}
                            <div className="flex items-baseline gap-1 pt-1">
                                <Skeleton className="h-4 w-8" />
                                <Skeleton className="h-6 w-14" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}

export const ProductsRelated = ({ storeId, categoryIds, productCurrentIds }: ProductsRelatedProps) => {
    const { data: products, isPending } = useQuery({
        ...orpc.customer.getProductsRelated.queryOptions({ input: { storeId, categoryIds, productCurrentIds } }),
        placeholderData: keepPreviousData,
        enabled: categoryIds.length > 0,
    });

    if (!products) {
        return null;
    }

    return (
        <section className="px-12 py-6 mt-6">
            <h2 className="text-2xl font-bold text-balance md:text-xl mb-6">Products Related</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {isPending && <ProductsRelatedSkeleton />}
                {products.length === 0 && <p className="text-lg italic text-muted-foreground">No products related found</p>}
                {products.map((product) => {
                    return (
                        <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg">
                            <CardContent className="flex flex-col gap-4">
                                <div className="overflow-hidden rounded-md">
                                    <Image
                                        src={product.images[0].url}
                                        alt={product.name}
                                        width={200}
                                        height={200}
                                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <CardTitle className="line-clamp-1 text-lg font-semibold text-balance sm:text-xl">{product.name}</CardTitle>

                                    <div className="flex items-center gap-1" aria-label={`${product.averageRating} out of 5 stars`} role="img">
                                        {[...Array(5)].map((_, i) => {
                                            const starValue = i + 1;
                                            const isFull = product.averageRating >= starValue;
                                            const isHalf = product.averageRating >= starValue - 0.5 && product.averageRating < starValue;

                                            return (
                                                <div key={i} className="relative size-5">
                                                    {/* Empty star */}
                                                    <StarIcon className="absolute inset-0 text-slate-300" fill="none" />

                                                    {/* Full star */}
                                                    {isFull && <StarIcon className="absolute inset-0 text-amber-400" fill="currentColor" />}

                                                    {/* Half star */}
                                                    {isHalf && (
                                                        <div className="absolute inset-0 overflow-hidden w-1/2">
                                                            <StarIcon className="text-amber-400" fill="currentColor" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <span className="text-muted-foreground ml-1 mt-1">({product.averageRating})</span>
                                        <Separator orientation="vertical" />
                                        <div className="flex items-center gap-x-1">
                                            <span className="text-foreground text-sm">{product.favoriteCount}</span>
                                            <HeartIcon className="size-3 fill-rose-500 text-rose-500" />
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium">
                                        From <span className="text-lg font-bold tracking-tighter">${product.minPrice.toString()}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
};
