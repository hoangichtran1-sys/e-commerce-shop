"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingCartIcon, Share2Icon, Heart, TruckIcon, RotateCcwIcon, MinusIcon, PlusIcon, Trash2Icon, Edit3Icon, FlameIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Image from "next/image";
import { cn, formatPrice, capitalizeFirst, getAttributesFromVariants } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { Separator } from "@/components/ui/separator";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ProductsRelated } from "../products-related";
import { Preview } from "@/components/preview";
import { User } from "@/lib/auth";
import { useCart } from "@/features/customer/hooks/use-cart";
import { GROWTH_RATE, MONTH_QUANTITY } from "@/constants";
import { ReviewSection } from "./review-section";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { GetProduct } from "@/features/customer/types";

interface ProductDetailProps {
    storeId: string;
    storeSlug: string;
    shippingFee: number;
    currentUser: User | null;
    product: GetProduct;
}

export const ProductView = ({ storeId, storeSlug, shippingFee, currentUser, product }: ProductDetailProps) => {
    const [mainApi, setMainApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const { addToCart, isProductVariantInCart, removeProductVariant, productVariantItems, setQuantityVariant } = useCart(storeSlug);

    // const { data: product } = useSuspenseQuery(orpc.customer.getProduct.queryOptions({ input: { storeId, productId } }));
    const { data: trendingData } = useQuery(orpc.customer.checkTrending.queryOptions({ input: { storeId, productId: product.id } }));

    const variants = product.variants.map((variant) => ({
        sku: variant.sku,
        stock: variant.stock,
        price: variant.price,
        combination: variant.combination as Record<string, string>,
        id: variant.id,
    }));

    const availableAttributes = useMemo(() => getAttributesFromVariants(variants), [variants]);

    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(variants[0]?.combination || {});

    const activeVariant = useMemo(() => {
        return variants.find((variant) => {
            const combo = variant.combination;
            return Object.entries(selectedAttributes).every(([key, value]) => combo[key] === value);
        });
    }, [selectedAttributes, variants]);

    const initialQuantity = activeVariant && productVariantItems?.[activeVariant.id] ? productVariantItems[activeVariant.id].quantity : 1;

    const [quantity, setQuantity] = useState(initialQuantity);

    const handleSelectAttribute = (key: string, value: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    useEffect(() => {
        if (!mainApi) return;

        const handleSelect = () => {
            const currentIndex = mainApi.selectedScrollSnap();
            setCurrent(currentIndex);
        };

        mainApi.on("select", handleSelect);

        return () => {
            mainApi.off("select", handleSelect);
        };
    }, [mainApi]);

    const scrollTo = (index: number) => {
        mainApi?.scrollTo(index);
    };

    const updateQuantity = (increment: boolean) => {
        setQuantity((current) => Math.max(1, current + (increment ? 1 : -1)));
    };

    const isTrending = useMemo(() => {
        if (!trendingData) return false;

        return trendingData.growthRate >= GROWTH_RATE && trendingData.thisMonthQty >= MONTH_QUANTITY;
    }, [trendingData]);

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/50">
                {/* Header Section */}
                <div className="flex flex-col justify-between items-start gap-1">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>
                            Category:{" "}
                            <b className="text-foreground">
                                {product.category.parent?.name} • {product.category.name}
                            </b>
                        </span>
                        {(product.category?.parent?.promotions ?? []).length > 0 && (
                            <span>
                                Promotion: <b className="text-foreground">{product.category.parent?.promotions[0].value}%</b>
                            </span>
                        )}
                        <span>
                            Sku: <b className="text-foreground">{activeVariant?.sku || "No sku"}</b>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Gallery */}
                    <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-6 h-fit">
                        <Carousel setApi={setMainApi} className="w-full relative">
                            {isTrending && (
                                <Badge className="absolute left-3 top-3 backdrop-blur z-10">
                                    <FlameIcon className="size-4" />
                                    Trending
                                </Badge>
                            )}
                            <CarouselContent>
                                {product.images.map((src, i) => (
                                    <CarouselItem key={i}>
                                        <div className="aspect-square rounded-xl overflow-hidden border bg-white">
                                            <Image height={250} width={200} src={src.url} alt="Product" className="w-full h-full object-cover" />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                        </Carousel>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {product.images.map((src, i) => (
                                <button
                                    key={i}
                                    onMouseEnter={() => scrollTo(i)}
                                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${current === i ? "border-primary" : "border-transparent opacity-60"
                                        }`}
                                >
                                    <Image width={50} height={50} src={src.url} alt="Thumb" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        {/* Description & Details */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div onClick={() => setIsExpanded((current) => !current)}>
                                    <h3 className="font-bold mb-2">Description:</h3>
                                    <div
                                        className={cn(
                                            "text-sm text-muted-foreground whitespace-pre-wrap prose prose-slate max-w-none dark:prose-invert",
                                            !isExpanded && "line-clamp-3",
                                        )}
                                    >
                                        <Preview value={product.description || "No description"} />
                                    </div>
                                </div>

                                {activeVariant ? (
                                    <>
                                        <div className="flex items-center gap-x-2">
                                            {product.category?.parent?.promotions && product.category.parent.promotions.length > 0 ? (
                                                <>
                                                    <h2 className="font-bold tracking-tighter text-4xl mb-2">
                                                        {formatPrice(
                                                            activeVariant.price -
                                                            (activeVariant.price * product.category.parent.promotions[0].value) / 100,
                                                        )}
                                                    </h2>
                                                    <h2 className="italic font-light tracking-tighter text-4xl mb-2 text-muted-foreground line-through">
                                                        {formatPrice(activeVariant.price)}
                                                    </h2>
                                                </>
                                            ) : (
                                                <h2 className="font-bold tracking-tighter text-4xl mb-2">{formatPrice(activeVariant.price)}</h2>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between w-full max-w-[50%]">
                                                <h3 className="font-bold mb-2">Select Quantity</h3>
                                                {activeVariant.stock > 0 ? (
                                                    <Badge variant="secondary">Only {activeVariant.stock} Items Left!</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Out of Stock!</Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8 cursor-pointer"
                                                    onClick={() => updateQuantity(false)}
                                                    disabled={quantity <= 1 || activeVariant.stock === 0}
                                                >
                                                    <MinusIcon />
                                                </Button>
                                                <span
                                                    className={cn(
                                                        "w-8 text-center text-sm font-medium",
                                                        activeVariant.stock === 0 && "text-muted-foreground",
                                                    )}
                                                >
                                                    {quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8 cursor-pointer"
                                                    onClick={() => updateQuantity(true)}
                                                    disabled={quantity >= activeVariant.stock || activeVariant.stock === 0}
                                                >
                                                    <PlusIcon />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground italic">Not variant found</p>
                                )}

                                <div>
                                    <h3 className="font-bold mb-2">Key Features:</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {product.features.map((f, i) => (
                                            <li key={i}>{f}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    {Object.entries(availableAttributes).map(([attrName, attrValues]) => (
                                        <div key={attrName} className="space-y-2">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-2">{capitalizeFirst(attrName)}:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {attrValues.map((value) => {
                                                    const isSelected = selectedAttributes[attrName] === value;

                                                    return attrName === "color" ? (
                                                        <div
                                                            onClick={() => handleSelectAttribute(attrName, value)}
                                                            className={cn(
                                                                "rounded-md h-9 w-9 cursor-pointer border border-gray-400",
                                                                isSelected && "ring-2 ring-black ring-offset-2",
                                                            )}
                                                            style={{ backgroundColor: value }}
                                                            key={value}
                                                        />
                                                    ) : (
                                                        <Button
                                                            key={value}
                                                            variant={isSelected ? "default" : "outline"}
                                                            size="sm"
                                                            className="h-9 px-4 rounded-md"
                                                            onClick={() => handleSelectAttribute(attrName, value)}
                                                        >
                                                            {value}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-end gap-x-2">
                                    <Button aria-label="Share product" className="rounded-full" size="icon-xs" variant="outline" onClick={() => { }}>
                                        <Share2Icon className="size-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon-xs"
                                        className="rounded-full"
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        <Heart className={cn("size-3", isWishlisted && "fill-rose-500 text-rose-500")} />
                                    </Button>
                                    {activeVariant && (
                                        <div className="flex items-center gap-x-3">
                                            {isProductVariantInCart(activeVariant.id) ? (
                                                <>
                                                    {initialQuantity !== quantity && (
                                                        <Button
                                                            onClick={() => {
                                                                setQuantityVariant(activeVariant.id, quantity);
                                                            }}
                                                        >
                                                            <Edit3Icon />
                                                            Update to Cart
                                                        </Button>
                                                    )}
                                                    <Button
                                                        onClick={() => {
                                                            removeProductVariant(activeVariant.id);
                                                        }}
                                                        variant="destructive"
                                                    >
                                                        <Trash2Icon />
                                                        Remove to Cart
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    disabled={activeVariant.stock === 0}
                                                    onClick={() => {
                                                        addToCart({ productVariantId: activeVariant.id, quantity });
                                                    }}
                                                >
                                                    <ShoppingCartIcon />
                                                    {activeVariant.stock === 0 ? "Out of stock" : "Add to Cart"}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <>
                                    <Separator />
                                    <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                                        <Item variant="outline">
                                            <ItemMedia variant="icon">
                                                <TruckIcon />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle>Free Delivery</ItemTitle>
                                                <ItemDescription>Free delivery on orders over {formatPrice(shippingFee)}.</ItemDescription>
                                            </ItemContent>
                                        </Item>

                                        <Item variant="outline">
                                            <ItemMedia variant="icon">
                                                <RotateCcwIcon />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle>Return Delivery</ItemTitle>
                                                <ItemDescription>Free 30Days Delivery Returns.</ItemDescription>
                                            </ItemContent>
                                        </Item>
                                    </div>
                                </>
                            </CardContent>
                        </Card>
                        <Suspense fallback={<p>Loading...</p>}>
                            <ErrorBoundary fallback={<p>Error!</p>}>
                                <ReviewSection storeId={storeId} productId={product.id} currentUser={currentUser} />
                            </ErrorBoundary>
                        </Suspense>
                    </div>
                </div>
            </div>
            <ProductsRelated storeId={storeId} categoryIds={[product.categoryId]} productCurrentIds={[product.id]} />
        </>
    );
};
