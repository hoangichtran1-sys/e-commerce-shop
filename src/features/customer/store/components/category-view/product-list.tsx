import { GetProducts } from "@/features/customer/types"
import { ProductCard } from "../product-featured/product-card";

interface ProductListProps {
    data: GetProducts;
}

export const ProductList = ({ data }: ProductListProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.map((item) =>(
                <ProductCard key={item.id} product={item} isGlobal={false} />
            ))}
        </div>
    )
}