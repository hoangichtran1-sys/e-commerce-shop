"use client";

import { NoResults } from "@/components/no-results";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BoxIcon } from "lucide-react";
import { ProductCard } from "./product-card";

interface ProductListProps {
    title: string;
    storeId: string;
}

export const ProductFeatured = ({ title, storeId }: ProductListProps) => {
    const { data: products } = useSuspenseQuery(orpc.customer.getProducts.queryOptions({ input: { storeId, isFeatured: true } }));

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-3xl">{title}</h3>
            {products.length === 0 && <NoResults icon={BoxIcon} topic="products" />}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {products.map((item) => (
                    <ProductCard isGlobal={true} key={item.id} product={item} />
                ))}
            </div>
        </div>
    );
};
