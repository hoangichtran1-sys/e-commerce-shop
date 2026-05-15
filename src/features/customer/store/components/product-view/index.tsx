"use client";

import { useState, useEffect, useMemo } from "react";
import {
    FlameIcon,
    Star,
    PlusCircleIcon,
    ShoppingCartIcon,
    Share2Icon,
    MessageSquareIcon,
    FlagIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    Heart,
    Edit2Icon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Image from "next/image";
import { cn, formatNumber, formatPrice } from "@/lib/utils";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { format, formatDistanceToNow } from "date-fns";
import { NoResults } from "@/components/no-results";
import { ReviewModal } from "@/components/modals/review-modal";
import { authClient } from "@/lib/auth-client";
import { Hint } from "@/components/hint";

const PRODUCT_FEATURES = {
    features: ["Industry-leading noise cancellation", "30-hour battery life", "Touch sensor controls", "Speak-to-chat technology"],
};

interface ProductDetailProps {
    storeId: string;
    productId: string;
}

export const ProductView = ({ storeId, productId }: ProductDetailProps) => {
    const [mainApi, setMainApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);

    const session = authClient.useSession();
    const currentUser = session?.data?.user;

    const { data: product } = useSuspenseQuery(orpc.customer.getProduct.queryOptions({ input: { storeId, productId } }));

    const { data: initialData } = useQuery({
        ...orpc.customer.getReview.queryOptions({ input: { storeId, productId } }),
        enabled: !!currentUser,
    });

    useEffect(() => {
        if (!mainApi) return;
        mainApi.on("select", () => {
            setCurrent(mainApi.selectedScrollSnap());
        });
    }, [mainApi]);

    const scrollTo = (index: number) => {
        mainApi?.scrollTo(index);
    };

    const rating = useMemo(() => {
        const totalReview = product.reviews.length;
        if (totalReview === 0) return 0;

        const totalRating = product.reviews.reduce((curr, item) => curr + item.rating, 0);
        return totalRating / totalReview;
    }, [product]);

    const reviewProgress = useMemo(() => {
        const oneStar = product.reviews.filter((rev) => rev.rating === 1).length;
        const twoStar = product.reviews.filter((rev) => rev.rating === 2).length;
        const threeStar = product.reviews.filter((rev) => rev.rating === 3).length;
        const fourStar = product.reviews.filter((rev) => rev.rating === 4).length;
        const fiveStar = product.reviews.filter((rev) => rev.rating === 5).length;

        return [fiveStar, fourStar, threeStar, twoStar, oneStar];
    }, [product]);

    const reviewsData = useMemo(() => {
        if (currentUser) {
            const currentReview = product.reviews.find((rev) => rev.userId === currentUser.id);
            if (currentReview) {
                const otherReviews = product.reviews.filter((rev) => rev.userId !== currentUser.id);
                return [currentReview, ...otherReviews];
            }
        }
        return product.reviews;
    }, [currentUser, product.reviews]);

    return (
        <>
            <ReviewModal
                initialData={initialData}
                storeId={storeId}
                productId={productId}
                isOpen={openReviewModal}
                onClose={() => setOpenReviewModal(false)}
            />
            <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/50">
                {/* Header Section */}
                <div className="flex flex-col justify-between items-start gap-1">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>
                            Category: <b className="text-foreground">{product.category.name}</b>
                        </span>
                        {product.category.promotions.length > 0 && (
                            <span>
                                Promotion: <b className="text-foreground">{product.category.promotions[0].value}%</b>
                            </span>
                        )}
                        <span>
                            SKU: <b className="text-foreground">{product.sku}</b>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Gallery */}
                    <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-6 h-fit">
                        <Carousel setApi={setMainApi} className="w-full relative">
                            {product.isFeatured && (
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
                                    onClick={() => scrollTo(i)}
                                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                        current === i ? "border-primary" : "border-transparent opacity-60"
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
                                    <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", !isExpanded && "line-clamp-3")}>
                                        {product?.description || "No description"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    {/* <h2 className="italic font-light tracking-tighter text-4xl mb-2 text-muted-foreground line-through">
                                    {formatPrice(100)}
                                </h2> */}
                                    <h2 className="font-bold tracking-tighter text-4xl mb-2">{formatPrice(product.price)}</h2>
                                </div>
                                <div>
                                    <Badge className={cn("p-4", product.inStock ? "bg-emerald-200/30" : "bg-rose-200/30")}>
                                        <div className="flex items-center gap-x-2">
                                            <div className={cn("h-2 w-2 rounded-full", product.inStock ? "bg-green-500" : "bg-red-500")} />
                                            <span className={cn(product.inStock ? "text-green-700" : "text-red-700")}>
                                                {product.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </div>
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Key Features:</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {PRODUCT_FEATURES.features.map((f, i) => (
                                            <li key={i}>{f}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex items-center gap-x-10">
                                    <div>
                                        <h3 className="font-bold mb-2">Size</h3>
                                        <Button variant="outline" className="h-8 px-4 py-2 size-10 rounded-full p-0 hover:bg-background">
                                            {product.size.value}
                                        </Button>
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-2">Color</h3>
                                        <div className="h-10 w-10 rounded-full border" style={{ backgroundColor: product.color.value }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 rounded-full cursor-pointer"
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        <Heart className={cn("size-5", isWishlisted && "fill-rose-500 text-rose-500")} />
                                    </Button>
                                    <Button disabled={!product.inStock} onClick={() => {}}>
                                        <ShoppingCartIcon />
                                        Add to Card
                                    </Button>
                                    <Button variant="outline" onClick={() => {}}>
                                        <Share2Icon />
                                        Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                                <CardTitle className="text-lg font-bold">Reviews</CardTitle>
                                <Button
                                    onClick={() => setOpenReviewModal(true)}
                                    variant="outline"
                                    size="sm"
                                    className={cn("gap-2", initialData && "hidden")}
                                >
                                    <PlusCircleIcon className="w-4 h-4" /> Submit Review
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 order-2 md:order-1 space-y-4">
                                        {product.reviews.length === 0 && <NoResults icon={MessageSquareIcon} topic="reviews" />}
                                        {reviewsData.map((rev) => {
                                            return (
                                                <div key={rev.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            {rev.user.image ? (
                                                                <Avatar>
                                                                    <AvatarImage src={rev.user.image} />
                                                                </Avatar>
                                                            ) : (
                                                                <GeneratedAvatar seed={rev.user.name || rev.user.email} />
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-sm">{rev.user.name || rev.user.email}</p>
                                                                <div className="flex items-center gap-x-2 mt-1">
                                                                    <Badge variant="outline">
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                            <span className="text-xs font-semibold text-neutral-600">
                                                                                {rev.rating}
                                                                            </span>
                                                                        </div>
                                                                    </Badge>
                                                                    <span className="text-muted-foreground">•</span>
                                                                    <Hint text={format(rev.createdAt, "LLL dd, y")}>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}
                                                                        </span>
                                                                    </Hint>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-x-2">
                                                            <Button variant="ghost" onClick={() => {}} size="icon">
                                                                <FlagIcon />
                                                            </Button>
                                                            {currentUser && currentUser.id === rev.userId && (
                                                                <Button variant="ghost" onClick={() => setOpenReviewModal(true)} size="icon">
                                                                    <Edit2Icon />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-5">
                                                        &quot;{rev.feedback || "No feedback"}&quot;
                                                    </p>
                                                    <div className="mt-4 flex gap-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setIsLiked((current) => !current)}
                                                            className="h-8 px-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                                                            aria-label="review reaction"
                                                        >
                                                            <ThumbsUpIcon className={cn("size-4", isLiked && "fill-current")} />
                                                            <span>{isLiked ? 1 : 0}</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setIsDisliked((current) => !current)}
                                                            className="h-8 px-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                                                            aria-label="review reaction"
                                                        >
                                                            <ThumbsDownIcon className={cn("size-4", isDisliked && "fill-current")} />
                                                            <span>{isDisliked ? 1 : 0}</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {reviewsData.length >= 8 && (
                                            <Button variant="ghost" className="w-full text-muted-foreground">
                                                Load more..
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-6 order-1 md:order-2">
                                        <div className="p-6 border rounded-xl sticky top-6">
                                            <div className="flex flex-col items-center gap-2 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, i) => {
                                                            const isFilled = i < Math.floor(rating);

                                                            return (
                                                                <Star
                                                                    key={i}
                                                                    className={`size-5 ${isFilled ? "text-orange-400" : "text-slate-300"}`}
                                                                    fill={isFilled ? "currentColor" : "none"}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    <span className="font-bold text-2xl">{rating}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    (Based on {formatNumber(product.reviews.length)} reviews)
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                {reviewProgress.map((pct, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                        <div className="w-8 text-sm flex items-center gap-x-1">
                                                            {5 - i} <Star className="size-4 fill-amber-400 text-amber-400" />{" "}
                                                        </div>
                                                        <Progress
                                                            value={product.reviews.length > 0 ? (pct / product.reviews.length) * 100 : 0}
                                                            className="h-1.5"
                                                        />
                                                        <span className="w-8 text-right">
                                                            {product.reviews.length > 0 ? (pct / product.reviews.length) * 100 : 0}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};
