"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, BoxIcon, HeartIcon, MinusCircleIcon, MoreVerticalIcon, StarIcon } from "lucide-react";
import { ProductGetMany } from "../types";
import { capitalizeFirst } from "@/lib/utils";
import { ProductActions } from "./product-actions";
import { ToggleFeatured } from "./toggle-in-featured";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ShowVariants } from "./show-variants";
import { Badge } from "@/components/ui/badge";
import { LOW_STOCK } from "@/constants";

export const columns: ColumnDef<ProductGetMany[number]>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const name = row.original.name;
            const firstImage = row.original.images[0];
            const soldCount = row.original.soldCount;
            const totalFavorite = row.original._count.favorites;

            return (
                <div className="flex items-center gap-x-2">
                    <Image src={firstImage.url} alt={name} width={54} height={54} className="object-cover grayscale" />
                    <div className="flex flex-col gap-y-1">
                        <p className="line-clamp-2">{name}</p>
                        <p className="text-muted-foreground">
                            Sold count: <b className="text-foreground">{soldCount}</b>
                        </p>

                        <div className="flex items-center gap-x-1.5">
                            <span className="text-sm font-semibold">{totalFavorite}</span>
                            <HeartIcon className="size-3 fill-rose-500 text-rose-500" />
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "features",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Features
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const features = row.original.features;

            return (
                <Accordion type="single" collapsible>
                    <AccordionItem value="features">
                        <AccordionTrigger className="max-w-md">{features.length} features related</AccordionTrigger>
                        <AccordionContent>
                            <ItemGroup className="max-w-sm">
                                {features.map((feature, index) => (
                                    <Item className="bg-white" key={index} variant="outline">
                                        <ItemMedia>
                                            <BoxIcon />
                                        </ItemMedia>
                                        <ItemContent className="gap-1">
                                            <ItemTitle>Features {index + 1}</ItemTitle>
                                            <ItemDescription className="text-xs text-wrap">
                                                <span className="line-clamp-3">{feature}</span>
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <Button variant="destructive" size="icon" className="rounded-full">
                                                <MinusCircleIcon />
                                            </Button>
                                        </ItemActions>
                                    </Item>
                                ))}
                            </ItemGroup>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            );
        },
    },
    {
        id: "category",
        accessorFn: (row) => row.category.parent?.name,
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Category
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const categoryName = row.original.category.name;
            const parentName = row.original.category.parent?.name;

            if (!parentName) {
                return <p className="line-clamp-1">{categoryName}</p>;
            }

            return (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{parentName}</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator> / </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;

            const statusOption = {
                label: capitalizeFirst(status as string),
                color: "bg-orange-500",
            };

            if (status === "PUBLISHED") {
                statusOption.color = "bg-green-500";
            }
            if (status === "ARCHIVED") {
                statusOption.color = "bg-blue-500";
            }

            return (
                <div className="flex items-center gap-x-2">
                    <div className={`h-2 w-2 rounded-full ${statusOption.color}`} />
                    <span className="text-xs font-medium">{statusOption.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "rating",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Rating
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const totalReview = row.original._count.reviews;

            if (totalReview === 0) {
                return <p className="italic text-muted-foreground">No rating information</p>;
            }

            const totalRating = row.original.reviews.reduce((curr, item) => curr + item.rating, 0);
            const rating = totalRating / totalReview;

            return (
                <div className="flex items-center gap-1">
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

                    <span className="text-muted-foreground ml-1 text-sm">{rating}</span>
                    <span className="text-muted-foreground ml-1 text-sm">({totalReview})</span>
                </div>
            );
        },
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
            const totalStock = row.original.variants.reduce((curr, item) => curr + item.stock, 0);

            if (totalStock === 0) {
                <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">Out of Stock</Badge>;
            }
            if (totalStock > 0 && totalStock <= LOW_STOCK) {
                <Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">Low Stock</Badge>;
            }

            return <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">In Stock</Badge>;
        },
    },
    {
        accessorKey: "isFeatured",
        header: () => <div className="text-center w-[50%]">Featured</div>,
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;
            const isFeatured = row.original.isFeatured;

            return <ToggleFeatured isChecked={isFeatured} id={id} storeId={storeId} />;
        },
    },

    {
        id: "variants",
        header: () => <div className="text-center w-[50%]">Variants</div>,
        cell: ({ row }) => {
            const variants = row.original.variants.map((variant) => ({
                combination: variant.combination as Record<string, string>,
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku,
            }));
            const storeId = row.original.storeId;
            const productId = row.original.id;
            const productName = row.original.name;

            return <ShowVariants storeId={storeId} productId={productId} productName={productName} variants={variants} />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;

            return (
                <ProductActions id={id} storeId={storeId}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for product ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </ProductActions>
            );
        },
    },
];
