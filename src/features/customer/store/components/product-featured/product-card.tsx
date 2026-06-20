import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpandIcon, StarIcon, SparklesIcon, EyeIcon, HeartIcon } from "lucide-react";
import { FALLBACK_IMAGE } from "@/constants";
import { GetProducts } from "@/features/customer/types";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";
import { useState } from "react";
import { ExpandedProduct } from "../product-view/expanded-product";
import { useRouter } from "next/navigation";
import { Hint } from "@/components/hint";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardProps {
    product: GetProducts["items"][number];
    isGlobal: boolean;
}

export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden border-0 shadow-none pt-0 pointer-events-none w-full">
            {/* IMAGE CONTAINER (Giữ nguyên tỉ lệ aspect-square) */}
            <div className="relative aspect-square rounded-md overflow-hidden">
                <Skeleton className="h-full w-full" />

                {/* Giả lập một Badge Category mờ ở góc trái nếu muốn layout tự nhiên */}
                <div className="absolute left-2 top-2">
                    <Skeleton className="h-5 w-16 rounded-md bg-neutral-200/50 dark:bg-neutral-800/50" />
                </div>
            </div>

            {/* PRODUCT INFO CONTENT */}
            <CardContent className="space-y-3 p-4">
                {/* NAME & STOCK BADGE */}
                <div className="flex items-center justify-between gap-x-2">
                    {/* Product Name */}
                    <Skeleton className="h-6 w-2/3" />
                    {/* Stock Badge */}
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>

                {/* RATING & FAVORITE AREA */}
                <div className="flex items-center gap-2 h-4">
                    {/* Rating (Star + Number) */}
                    <div className="flex items-center gap-x-1">
                        <Skeleton className="size-4 rounded-sm" />
                        <Skeleton className="h-4 w-12" />
                    </div>

                    <Separator orientation="vertical" className="h-3" />

                    {/* Favorite (Heart + Number) */}
                    <div className="flex items-center gap-x-1">
                        <Skeleton className="size-4 rounded-sm" />
                        <Skeleton className="h-4 w-6" />
                    </div>
                </div>

                {/* PRICE & OPTIONS */}
                <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Price Label (From $XX) */}
                    <div className="flex items-baseline gap-1">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-6 w-12" />
                    </div>

                    {/* Options Badge */}
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>
            </CardContent>
        </Card>
    );
}

export function ProductCard({ product, isGlobal }: ProductCardProps) {
    const router = useRouter();
    const storeSlug = useStoreSlug();
    const discount = product.category.parent ? product.category.parent.promotions[0]?.value : null;

    const stock = product.variants.reduce((total, variant) => total + variant.stock, 0);

    const [openPreviewModal, setOpenPreviewModal] = useState(false);

    return (
        <>
            <Card
                onClick={() => router.push(`/${storeSlug}/products/${product.id}`)}
                className="group overflow-hidden border-0 shadow-none transition-all hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer pt-0"
            >
                {/* IMAGE */}
                <div className="relative aspect-square rounded-md object-cover overflow-hidden">
                    <Image
                        fill
                        src={product.images.length > 0 ? product.images[0].url : FALLBACK_IMAGE}
                        alt={product.name}
                        className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2"
                    />

                    {/* CATEGORY */}
                    {isGlobal ? (
                        <Badge className="absolute left-2 top-2 backdrop-blur">{product.category.name}</Badge>
                    ) : product.isFeatured ? (
                        <Badge className="absolute left-2 top-2 backdrop-blur">
                            <SparklesIcon className="size-3" />
                            Featured
                        </Badge>
                    ) : null}

                    {/* DISCOUNT */}
                    {isGlobal && discount && <Badge className="absolute right-2 top-2 bg-red-500 hover:bg-red-500">-{discount}%</Badge>}

                    {/* ACTIONS */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            return;
                        }}
                        className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition duration-300 group-hover:opacity-100"
                    >
                        <div className="flex items-center gap-3 rounded-full bg-white/80 p-2 backdrop-blur dark:bg-black/70">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPreviewModal(true);
                                    return;
                                }}
                                size="icon"
                                variant="secondary"
                                className="rounded-full"
                            >
                                <ExpandIcon className="size-4" />
                            </Button>

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPreviewModal(true);
                                    return;
                                }}
                                size="icon"
                                className="rounded-full"
                            >
                                <EyeIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="space-y-3 p-4">
                    {/* NAME */}
                    <div className="flex items-center gap-x-2">
                        <p className="line-clamp-1 text-xl font-semibold">{product.name}</p>
                        {stock === 0 ? (
                            <Badge variant="destructive">Out of stock</Badge>
                        ) : (
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">In stock</Badge>
                        )}
                    </div>

                    {/* RATING */}
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-x-1">
                            <StarIcon className="size-4 fill-amber-500 text-amber-500" />
                            <span className="text-foreground text-sm font-semibold">{product.averageRating}</span>
                            <span className="text-muted-foreground text-sm">({formatNumber(product.reviewCount)})</span>
                        </div>
                        <Separator orientation="vertical" />
                        <div className="flex items-center gap-x-1">
                            <HeartIcon className="size-4 fill-rose-500 text-rose-500" />
                            <span className="text-foreground text-sm font-semibold">{product.favoriteCount}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Hint text={`Sold count: ${product.soldCount}`}>
                            <p className="text-sm font-medium">
                                From <span className="text-lg font-bold tracking-tighter">${product.minPrice.toString()}</span>
                            </p>
                        </Hint>

                        <Badge variant="secondary">{product._count.variants} options</Badge>
                    </div>

                    {/* SOLD COUNT */}
                    {/* <div className="flex items-end gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Sold count: <b className="font-semibold text-foreground">{product.soldCount}</b>
                        </span>
                    </div> */}
                </CardContent>
            </Card>
            <ExpandedProduct isOpen={openPreviewModal} onOpenChange={setOpenPreviewModal} storeId={product.storeId} productId={product.id} />
        </>
    );
}
