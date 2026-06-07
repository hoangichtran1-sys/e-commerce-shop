"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-rq.client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import Image from "next/image";

interface ProductsRelatedProps {
    storeId: string;
    categoryIds: string[];
    productCurrentIds: string[];
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
                {isPending && <p>Loading...</p>}
                {products.length === 0 && <p className="text-lg italic text-muted-foreground">No products related found</p>}
                {products.map((product) => {
                    const totalReview = product._count.reviews;
                    const rating = totalReview === 0 ? 0 : product.reviews.reduce((curr, item) => curr + item.rating, 0) / totalReview;

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

                                    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`} role="img">
                                        {[...Array(5)].map((_, i) => {
                                            const starValue = i + 1;
                                            const isFull = rating >= starValue;
                                            const isHalf = rating >= starValue - 0.5 && rating < starValue;

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
                                        <span className="text-muted-foreground ml-1 mt-1">({rating})</span>
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
