import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpandIcon, StarIcon, SparklesIcon, EyeIcon } from "lucide-react";
import { FALLBACK_IMAGE } from "@/constants";
import { GetProducts } from "@/features/customer/types";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";
import { useMemo, useState } from "react";
import { ExpandedProduct } from "../product-view/expanded-product";
import { useRouter } from "next/navigation";
import { Hint } from "@/components/hint";

interface ProductCardProps {
    product: GetProducts[number];
    isGlobal: boolean;
}

export function ProductCard({ product, isGlobal }: ProductCardProps) {
    const router = useRouter();
    const storeSlug = useStoreSlug();
    const discount = product.category.parent ? product.category.parent.promotions[0]?.value : null;

    const stock = product.variants.reduce((total, variant) => total + variant.stock, 0);

    const [openPreviewModal, setOpenPreviewModal] = useState(false);

    const rating = useMemo(() => {
        const totalReview = product._count.reviews;
        if (totalReview === 0) return 0;

        const totalRating = product.reviews.reduce((curr, item) => curr + item.rating, 0);
        return totalRating / totalReview;
    }, [product]);
    console.log(product.minPrice);

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
                        <span className="text-muted-foreground ml-1 text-sm">({product._count.reviews})</span>
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
