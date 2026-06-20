import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { ChevronRightIcon } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { GetProductsLowStock } from "../type";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/hint";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductLowStockProps {
    data: GetProductsLowStock;
}

export function ProductLowStockSkeleton() {
    return (
        <Card className="min-h-100">
            <CardHeader>
                <CardTitle>Product Low Stock</CardTitle>
                <CardDescription>Product Low Stock</CardDescription>
                <CardAction>
                    <Button disabled title="View All" size="icon-lg" className="rounded-md" variant="outline">
                        <ChevronRightIcon className="size-5 font-semibold text-neutral-300" />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {/* Giữ nguyên ItemGroup để kế thừa class "gap-4" gốc của bạn */}
                <ItemGroup className="gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Item key={index} variant="outline" role="listitem" className="pointer-events-none">
                            {/* Giả lập phần khung bấm thay vì thẻ <a> */}
                            <div className="flex w-full items-center gap-4">
                                {/* Media Image Skeleton */}
                                <ItemMedia variant="image" className="min-w-16 min-h-16 shrink-0">
                                    <Skeleton className="h-full w-full rounded-md" />
                                </ItemMedia>

                                {/* Content chính (Title & Subtitle) */}
                                <ItemContent>
                                    <ItemTitle className="line-clamp-1 text-2xl font-semibold">
                                        <Skeleton className="h-7 w-2/3 max-w-[250px]" />
                                    </ItemTitle>
                                    <ItemDescription className="flex gap-1 text-xs text-muted-foreground mt-1">
                                        <Skeleton className="h-4 w-1/2 max-w-[180px]" />
                                    </ItemDescription>
                                </ItemContent>

                                {/* Content phụ bên phải (Số lượng bán) */}
                                <ItemContent className="flex-none text-center">
                                    <ItemDescription>
                                        <Skeleton className="h-5 w-24 rounded-md" />
                                    </ItemDescription>
                                </ItemContent>
                            </div>
                        </Item>
                    ))}
                </ItemGroup>
            </CardContent>
        </Card>
    );
}

export const ProductLowStock = ({ data }: ProductLowStockProps) => {
    return (
        <Card className="min-h-100">
            <CardHeader>
                <CardTitle>Product Low Stock</CardTitle>
                <CardDescription>Product Low Stock</CardDescription>
                <CardAction>
                    <Button onClick={() => {}} title="View All" size="icon-lg" className="rounded-md" variant="outline">
                        <ChevronRightIcon className="size-5 font-semibold text-neutral-500" />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <ItemGroup className="gap-4">
                    {data.map((item) => {
                        const combination = Object.entries(item.combination)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" • ");
                        return (
                            <Item key={item.id} variant="outline" asChild role="listitem">
                                <a href="#">
                                    <ItemMedia variant="image" className="min-w-16 min-h-16">
                                        <Image
                                            src={item.product.images[0].url}
                                            alt={item.product.name}
                                            width={30}
                                            height={30}
                                            className="object-cover grayscale"
                                        />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="line-clamp-1 text-2xl font-semibold">{item.product.name}</ItemTitle>
                                        <ItemDescription>{combination}</ItemDescription>
                                    </ItemContent>
                                    <ItemContent className="flex-none text-center">
                                        <ItemDescription>
                                            {item.stock === 0 ? (
                                                <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">Out of Stock</Badge>
                                            ) : (
                                                <Hint text={`${item.stock} items left`}>
                                                    <Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                                                        Low Stock
                                                    </Badge>
                                                </Hint>
                                            )}
                                        </ItemDescription>
                                    </ItemContent>
                                </a>
                            </Item>
                        );
                    })}
                </ItemGroup>
            </CardContent>
        </Card>
    );
};
