import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpandIcon, ShoppingCartIcon, StarIcon, FlameIcon } from "lucide-react";
import { FALLBACK_IMAGE } from "@/constants";
import { GetProducts } from "@/features/customer/types";
import { formatPrice } from "@/lib/utils";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";

interface ProductCardProps {
    product: GetProducts[number];
    isGlobal: boolean;
}

export function ProductCard({ product, isGlobal }: ProductCardProps) {
    const storeSlug = useStoreSlug();
    const hasDiscount = true;
    // const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

    // const discountPercent = hasDiscount ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0;

    return (
        <Card className="group overflow-hidden border-0 shadow-none transition-all hover:-translate-y-1 hover:shadow-lg pt-0">
            <Link href={`/${storeSlug}/products/${product.id}`}>
                {/* IMAGE */}
                <div className="relative aspect-square rounded-md object-cover overflow-hidden">
                    <Image
                        fill
                        src={product.images.length > 0 ? product.images[0].url : FALLBACK_IMAGE}
                        alt={product.name}
                        className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2"
                    />

                    {/* CATEGORY */}
                    {!isGlobal ? (
                        <Badge className="absolute left-2 top-2 backdrop-blur">{product.category.name}</Badge>
                    ) : (
                        <Badge className="absolute left-2 top-2 backdrop-blur">
                            <FlameIcon className="size-3" />
                            Trending
                        </Badge>
                    )}

                    {/* DISCOUNT */}
                    {hasDiscount && <Badge className="absolute right-2 top-2 bg-red-500 hover:bg-red-500">-99%</Badge>}

                    {/* ACTIONS */}
                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="flex items-center gap-3 rounded-full bg-white/80 p-2 backdrop-blur dark:bg-black/70">
                            <Button size="icon" variant="secondary" className="rounded-full">
                                <ExpandIcon className="size-4" />
                            </Button>

                            <Button size="icon" className="rounded-full">
                                <ShoppingCartIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="space-y-3 p-4">
                    {/* NAME */}
                    <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>

                    {/* RATING */}
                    <div className="flex items-center gap-1">
                        {Array(5)
                            .fill("")
                            .map((_, i) => (
                                <StarIcon key={i} className={`size-4 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                            ))}

                        <span className="text-muted-foreground ml-1 text-xs">4.0</span>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-end gap-2">
                        <span className="text-lg font-semibold">{formatPrice(product.price)}</span>

                        {hasDiscount && <span className="text-muted-foreground text-sm line-through">{formatPrice(product.price)}</span>}
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 bg-background">
                    <Button className="w-full">Add to Cart</Button>
                </CardFooter>
            </Link>
        </Card>
    );
}
