import { GetProducts } from "@/features/customer/types";
import { ProductCard, ProductCardSkeleton } from "../product-featured/product-card";
import { NoResults } from "@/components/no-results";
import { BoxIcon } from "lucide-react";

interface ProductListProps {
    data: GetProducts["items"];
}

export const ProductListSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
};

export const ProductList = ({ data }: ProductListProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {data.length === 0 && (
                <div className="col-span-12">
                    <NoResults icon={BoxIcon} topic="products" />
                </div>
            )}
            {data.map((item) => (
                <ProductCard key={item.id} product={item} isGlobal={false} />
            ))}
        </div>
    );
};
