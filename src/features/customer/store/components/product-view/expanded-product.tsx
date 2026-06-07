import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";
import { orpc } from "@/orpc/orpc-rq.client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { capitalizeFirst, cn, formatPrice, getAttributesFromVariants } from "@/lib/utils";
import { Edit3Icon, Heart, MinusIcon, PlusIcon, ShoppingCartIcon, Star, Trash2Icon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart } from "@/features/customer/hooks/use-cart";

interface ExpandedProductProps {
    productId: string;
    storeId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export const ExpandedProduct = ({ productId, storeId, isOpen, onOpenChange }: ExpandedProductProps) => {
    const storeSlug = useStoreSlug();

    const { data: product, isPending } = useQuery(orpc.customer.getProduct.queryOptions({ input: { storeId, productId } }));

    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();

    const { addToCart, isProductVariantInCart, removeProductVariant, productVariantItems, setQuantityVariant } = useCart(storeSlug);

    useEffect(() => {
        if (!carouselApi) return;

        // Set carousel to the selected image
        carouselApi.scrollTo(selectedImage);

        // Update selected image when carousel changes
        const handleSelect = () => {
            const currentIndex = carouselApi.selectedScrollSnap();
            setSelectedImage(currentIndex);
        };

        carouselApi.on("select", handleSelect);
        return () => {
            carouselApi.off("select", handleSelect);
        };
    }, [carouselApi, selectedImage]);

    const variants = useMemo(() => {
        if (!product) return [];

        return product.variants.map((variant) => ({
            sku: variant.sku,
            stock: variant.stock,
            price: variant.price,
            combination: variant.combination as Record<string, string>,
            id: variant.id,
        }));
    }, [product]);

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

    const updateQuantity = (increment: boolean) => {
        setQuantity((current) => Math.max(1, current + (increment ? 1 : -1)));
    };

    const rating = useMemo(() => {
        if (!product) return 0;

        const totalReview = product._count.reviews;
        if (totalReview === 0) return 0;

        const totalRating = product.reviews.reduce((curr, item) => curr + item.rating, 0);
        return totalRating / totalReview;
    }, [product]);

    if (isPending) {
        return null;
    }

    if (!product) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="xl:min-w-300 lg:min-w-250 md:min-w-200 sm:min-w-150 min-w-100">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <section className="@container -mt-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 no-scrollbar max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-6 py-4 lg:grid-cols-2 lg:gap-8 lg:py-6 xl:grid-cols-3 xl:gap-12 xl:py-12">
                        {/* Product Info */}
                        <div className="flex flex-col justify-between gap-6 lg:gap-8">
                            <div className="flex flex-col gap-2 lg:gap-4">
                                <span className="text-sm font-semibold tracking-wide uppercase">{product.category.name} —</span>
                                <h2 className="text-xl font-bold tracking-tight text-balance lg:text-3xl">{product.name}</h2>
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
                                            <div className="flex items-start justify-between w-full max-w-full">
                                                <h3 className="font-bold mb-2">Quantity</h3>
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
                            </div>

                            {/* Thumbnails */}
                            <div className="flex flex-wrap gap-4">
                                {product.images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        onMouseEnter={() => setSelectedImage(index)}
                                        className={cn(
                                            "ring-offset-background size-16 cursor-pointer overflow-hidden rounded-sm ring-offset-2 transition-all lg:size-18",
                                            selectedImage === index && "ring-foreground ring-2",
                                        )}
                                    >
                                        <Image width={30} height={30} src={image.url} alt={image.productId} className="size-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Image */}
                        <div className="row-span-2 row-start-1 lg:col-start-2">
                            <Carousel setApi={setCarouselApi} className="w-full">
                                <CarouselContent>
                                    {product.images.map((image) => (
                                        <CarouselItem key={image.id}>
                                            <Image
                                                height={200}
                                                width={150}
                                                src={image.url}
                                                alt={image.productId}
                                                className="w-full h-90 rounded-lg object-cover"
                                            />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </div>

                        {/* Product Attributes */}
                        <div className="flex flex-col gap-6 lg:gap-10">
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

                            {/* Reviews */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-bold">Reviews</h3>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => {
                                        const starValue = i + 1;
                                        const isFull = rating >= starValue;
                                        const isHalf = rating >= starValue - 0.5 && rating < starValue;

                                        return (
                                            <div key={i} className="relative size-5">
                                                {/* Empty star */}
                                                <Star className="absolute inset-0 text-slate-300" fill="none" />

                                                {/* Full star */}
                                                {isFull && <Star className="absolute inset-0 text-amber-400" fill="currentColor" />}

                                                {/* Half star */}
                                                {isHalf && (
                                                    <div className="absolute inset-0 overflow-hidden w-1/2">
                                                        <Star className="text-amber-400" fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
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
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-9 rounded-full cursor-pointer"
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <Heart className={cn("size-5", isWishlisted && "fill-rose-500 text-rose-500")} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </DialogContent>
        </Dialog>
    );
};
