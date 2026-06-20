import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { capitalizeFirst, cn, formatPrice, getAttributesFromVariants, getErrorCode } from "@/lib/utils";
import { Edit3Icon, Heart, MinusIcon, PlusIcon, ShoppingCartIcon, Star, Trash2Icon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart } from "@/features/customer/hooks/use-cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpandedProductProps {
    productId: string;
    storeId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ExpandedProductSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 py-4 lg:grid-cols-2 lg:gap-8 lg:py-6 xl:grid-cols-3 xl:gap-12 xl:py-12 pointer-events-none">
            {/* COLUMN 1: Product Info & Thumbnails */}
            <div className="flex flex-col justify-between gap-6 lg:gap-8">
                <div className="flex flex-col gap-2 lg:gap-4">
                    {/* Category */}
                    <Skeleton className="h-5 w-24" />
                    {/* Product Name */}
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-2/3" />

                    {/* Price */}
                    <div className="pt-2">
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Quantity Section */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between w-full">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-28 rounded-md" />
                        </div>
                        {/* Quantity Input Selector Counterpart */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-8 rounded-md" />
                            <Skeleton className="h-5 w-8 mx-2" />
                            <Skeleton className="size-8 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="flex flex-wrap gap-4 pt-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="size-16 rounded-sm lg:size-18" />
                    ))}
                </div>
            </div>

            {/* COLUMN 2: Main Image (Row-start-1 để nó nhảy lên đầu trên mobile) */}
            <div className="row-span-2 row-start-1 lg:col-start-2">
                <div className="w-full h-90 rounded-lg overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </div>
            </div>

            {/* COLUMN 3: Product Attributes & Actions */}
            <div className="flex flex-col gap-6 lg:gap-10">
                {/* Giả lập 2 nhóm Attributes (ví dụ: Size và Color) */}
                {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="space-y-3">
                        <Skeleton className="h-5 w-20" />
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-9 w-12 rounded-md" />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Reviews */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="size-5 rounded-sm" />
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2 mt-auto">
                    {/* Add to cart / Update Button */}
                    <Skeleton className="h-10 w-36 rounded-md" />
                    {/* Wishlist Icon Button */}
                    <Skeleton className="size-9 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export const ExpandedProduct = ({ productId, storeId, isOpen, onOpenChange }: ExpandedProductProps) => {
    const storeSlug = useStoreSlug();
    const router = useRouter();
    const queryClient = useQueryClient();

    const currentUser = authClient.useSession()?.data?.user;

    const { data: product, isPending } = useQuery(orpc.customer.getProduct.queryOptions({ input: { storeId, productId } }));

    const [selectedImage, setSelectedImage] = useState(0);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();

    const { addToCart, isProductVariantInCart, removeProductVariant, productVariantItems, setQuantityVariant, variantItemsArray } =
        useCart(storeSlug);

    const addFavorite = useMutation(
        orpc.customer.addFavorite.mutationOptions({
            onSuccess: (data) => {
                toast.success("Added favorite to product");
                queryClient.invalidateQueries(
                    orpc.customer.getVariantsInCart.queryOptions({
                        input: {
                            storeId,
                            variantIds: variantItemsArray.map((variant) => variant.productVariantId),
                        },
                    }),
                );
                queryClient.invalidateQueries(orpc.customer.getProduct.queryOptions({ input: { storeId, productId: data.productId } }));
            },
            onError: (error) => {
                const code = getErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    toast.error("Please log in to continue");
                    router.replace(`/login?redirect=/${storeSlug}/cart`);
                    return;
                }
                toast.error(error.message);
            },
        }),
    );

    const removeFavorite = useMutation(
        orpc.customer.removeFavorite.mutationOptions({
            onSuccess: (data) => {
                toast.success("Removed favorite to product");
                queryClient.invalidateQueries(
                    orpc.customer.getVariantsInCart.queryOptions({
                        input: {
                            storeId,
                            variantIds: variantItemsArray.map((variant) => variant.productVariantId),
                        },
                    }),
                );
                queryClient.invalidateQueries(orpc.customer.getProduct.queryOptions({ input: { storeId, productId: data.productId } }));
            },
            onError: (error) => {
                const code = getErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    toast.error("Please log in to continue");
                    router.replace(`/login?redirect=/${storeSlug}/cart`);
                    return;
                }
                toast.error(error.message);
            },
        }),
    );

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

    const isFavorite = useMemo(() => {
        if (!product || !currentUser) return false;

        return product.favorites.some((f) => f.userId === currentUser.id);
    }, [product, currentUser]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="xl:min-w-300 lg:min-w-250 md:min-w-200 sm:min-w-150 min-w-100">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <section className="@container -mt-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 no-scrollbar max-h-[70vh] overflow-y-auto">
                    {isPending ? (
                        <ExpandedProductSkeleton />
                    ) : !product ? (
                        <div className="py-12 text-center text-muted-foreground italic">Product information could not be loaded.</div>
                    ) : (
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
                                            const isFull = product.averageRating >= starValue;
                                            const isHalf = product.averageRating >= starValue - 0.5 && product.averageRating < starValue;

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
                                        onClick={() => {
                                            if (isFavorite) {
                                                removeFavorite.mutate({ storeId, productId });
                                            } else {
                                                addFavorite.mutate({ storeId, productId });
                                            }
                                        }}
                                        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        <Heart className={cn("size-5", isFavorite && "fill-rose-500 text-rose-500")} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </DialogContent>
        </Dialog>
    );
};
