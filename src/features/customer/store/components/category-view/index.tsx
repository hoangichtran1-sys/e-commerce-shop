"use client";

import { Container } from "@/components/container";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Billboard } from "../billboard";
import { ProductFilter } from "./product-filter";
import { ProductList } from "./product-list";
import { Button } from "@/components/ui/button";
import { SlidersHorizontalIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface CategoryViewProps {
    storeId: string;
    categoryId: string;
}

const sortOptions = [
    { id: "featured", label: "Featured" },
    { id: "newest", label: "Newest" },
    { id: "price-low", label: "Price: Low to High" },
    { id: "price-high", label: "Price: High to Low" },
    { id: "rating", label: "Customer Rating" },
];

export const CategoryView = ({ storeId, categoryId }: CategoryViewProps) => {
    const [selectedSort, setSelectedSort] = useState("featured");

    const { data: category } = useSuspenseQuery(orpc.customer.getCategory.queryOptions({ input: { storeId, categoryId } }));

    return (
        <div className="bg-white">
            <Container>
                <Billboard data={category.billboard} />
                <div className="px-4 sm:px-6 lg:px-7 pb-24">
                    <div className="lg:grid lg:grid-cols-8 lg:gap-x-8">
                        <div className="hidden lg:block lg:col-span-2 hover:border hover:shadow-sm rounded-md hover:border-gray-200">
                            <ProductFilter />
                        </div>
                        <div className="lg:col-span-6">
                            <div className="flex flex-col gap-y-6">
                                <div className="flex items-center justify-between lg:justify-end gap-2">
                                    <Sheet>
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
                                            <ProductFilter />
                                        </SheetContent>
                                    </Sheet>
                                    <Select name="sort" value={selectedSort} onValueChange={(val) => setSelectedSort(val)}>
                                        <SelectTrigger className="min-w-60" id="select-sort">
                                            <SelectValue defaultValue="newest" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            {sortOptions.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <ProductList />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};
