"use client";

import { NoResults } from "@/components/no-results";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BoxIcon } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaginationProducts } from "@/features/customer/hooks/use-pagination-products";
import { Pagination } from "@/components/pagination";

interface ProductListProps {
    title: string;
    storeId: string;
}

export const ProductFeaturedSkeleton = () => {
    return (
        <div className="space-y-4">
            <Skeleton className="w-36 h-12" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
};

export const ProductFeatured = ({ title, storeId }: ProductListProps) => {
    const [paginationProducts, setPaginationProducts] = usePaginationProducts();
    const { data, isFetching } = useSuspenseQuery(
        orpc.customer.getProducts.queryOptions({ input: { storeId, isFeatured: true, ...paginationProducts } }),
    );

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-3xl">{title}</h3>
            {data.totalCount === 0 && <NoResults icon={BoxIcon} topic="products" />}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {data.items.map((item) => (
                    <ProductCard isGlobal={true} key={item.id} product={item} />
                ))}
            </div>
            <Pagination
                disabled={isFetching}
                totalPages={data.totalPages}
                page={data.page}
                pageSize={data.pageSize}
                onPageChange={(page) => setPaginationProducts({ page })}
                onPageSizeChange={(pageSize) => setPaginationProducts({ pageSize })}
                pageSizeOptions={[5, 10, 20, 50, 100]}
            />
        </div>
    );
};
