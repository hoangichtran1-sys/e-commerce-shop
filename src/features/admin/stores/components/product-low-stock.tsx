import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { ChevronRightIcon } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { GetProductsLowStock } from "../type";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/hint";

interface ProductLowStockProps {
    data: GetProductsLowStock;
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
