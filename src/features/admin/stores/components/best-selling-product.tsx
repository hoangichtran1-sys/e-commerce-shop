import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { ChevronRightIcon } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { GetTopSellingProducts } from "../type";
import Image from "next/image";
import { formatPriceDashboard } from "@/lib/utils";

interface BestSellingProductProps {
    data: GetTopSellingProducts;
}

export const BestSellingProduct = ({ data }: BestSellingProductProps) => {
    return (
        <Card className="min-h-100">
            <CardHeader>
                <CardTitle>Best Selling Product</CardTitle>
                <CardDescription>Top-Selling Products at a Glance</CardDescription>
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
                                        <ItemDescription className="flex gap-1 text-xs text-muted-foreground">
                                            <span>{combination}</span>
                                            <span>({formatPriceDashboard(item.price)})</span>
                                        </ItemDescription>
                                    </ItemContent>
                                    <ItemContent className="flex-none text-center">
                                        <ItemDescription>
                                            <span className="text-emerald-600">{item.sales} items sold</span>
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
