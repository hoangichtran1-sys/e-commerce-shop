"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Container } from "@/components/container";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Billboard } from "../billboard";
import { ProductFilter } from "./product-filter";
import { ProductList } from "./product-list";
import { Button } from "@/components/ui/button";
import { SlidersHorizontalIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CategoryBanner } from "./category-banner";
import { useProductsSort } from "@/features/customer/hooks/use-products-sort";
import { GetCategory, ProductsSort } from "@/features/customer/types";
import { useEffect, useState } from "react";
import { useProductsFilter } from "@/features/customer/hooks/use-products-filter";

interface CategoryViewProps {
    storeId: string;
    category: GetCategory;
    categoryId: string;
}

const sortOptions: { value: ProductsSort; label: string }[] = [
    { value: "newest", label: "Sort by newest" },
    { value: "a_z", label: "Name (A-Z)" },
    { value: "z_a", label: "Name (Z-A)" },
    { value: "featured", label: "Sort by featured" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
];

export const CategoryView = ({ storeId, category, categoryId }: CategoryViewProps) => {
    const [productsSort, setProductsSort] = useProductsSort();
    const [productsFilter] = useProductsFilter();

    const { data: products } = useSuspenseQuery(
        orpc.customer.getProducts.queryOptions({ input: { storeId, categoryId, ...productsFilter, ...productsSort } }),
    );

    const filterMap: Record<string, Set<string>> = {};

    category.products.forEach((product) => {
        product.searchableAttributes.forEach((attr) => {
            const [key, value] = attr.split(":");

            if (key && value) {
                const formattedKey = key.trim();

                if (!filterMap[formattedKey]) {
                    filterMap[formattedKey] = new Set<string>();
                }

                filterMap[formattedKey].add(value.trim());
            }
        });
    });

    const dynamicFilters = Object.entries(filterMap).map(([groupName, valuesSet]) => ({
        title: groupName,
        options: Array.from(valuesSet),
    }));

    const [openFilters, setOpenFilters] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setOpenFilters(false);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="bg-white">
            <Container>
                <Billboard data={category.billboard} />
                <div className="px-4 sm:px-6 lg:px-7 pb-24">
                    <div className="lg:grid lg:grid-cols-8 lg:gap-x-8">
                        <div className="hidden lg:block lg:col-span-2 border hover:shadow-sm rounded-md hover:border-gray-200 lg:sticky lg:top-6 h-fit">
                            <ProductFilter data={category.children} attributesGroup={dynamicFilters} />
                        </div>
                        <div className="lg:col-span-6 mt-6 lg:mt-0">
                            <div className="flex flex-col gap-y-6">
                                <div className="flex items-center justify-between lg:justify-end gap-2">
                                    <Sheet open={openFilters} onOpenChange={setOpenFilters}>
                                        <SheetTrigger asChild>
                                            <Button className="block lg:hidden w-auto" variant="outline">
                                                <div className="flex items-center gap-x-2">
                                                    <SlidersHorizontalIcon className="size-4" />
                                                    <span>Filters</span>
                                                </div>
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left">
                                            <SheetHeader>
                                                <SheetTitle className="text-xl font-semibold">Filters</SheetTitle>
                                            </SheetHeader>
                                            <Separator />
                                            <ProductFilter data={category.children} attributesGroup={dynamicFilters} />
                                        </SheetContent>
                                    </Sheet>
                                    <Select
                                        name="sort"
                                        value={productsSort.sort}
                                        onValueChange={(val) => setProductsSort({ sort: val as ProductsSort })}
                                    >
                                        <SelectTrigger className="min-w-60" id="select-sort">
                                            <SelectValue defaultValue="newest" />
                                        </SelectTrigger>
                                        <SelectContent position="item-aligned">
                                            {sortOptions.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-y-4">
                                    {category.promotions.length > 0 && <CategoryBanner promotion={category.promotions[0]} />}
                                    <Suspense fallback={<p>Loading...</p>}>
                                        <ErrorBoundary fallback={<p>Error!</p>}>
                                            <ProductList data={products} />
                                        </ErrorBoundary>
                                    </Suspense>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};
