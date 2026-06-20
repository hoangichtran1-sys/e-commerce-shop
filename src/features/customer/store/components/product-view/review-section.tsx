import { ReviewModal } from "@/components/modals/review-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ReviewCursor, ReviewsFilter } from "@/features/customer/types";
import { User } from "@/lib/auth";
import { MessageSquareIcon, PlusCircleIcon, Star } from "lucide-react";
import { useMemo } from "react";
import { orpc } from "@/orpc/orpc-rq.client";
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { NoResults } from "@/components/no-results";
import { cn, formatNumber } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReviewsFilter } from "@/features/customer/hooks/use-reviews-filter";
import { useReviewModal } from "@/features/customer/hooks/use-review-modal";
import { ReviewItem } from "./review-item";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface ReviewSectionProps {
    storeId: string;
    productId: string;
    currentUser: User | null;
}

const ratingOptions = [
    {
        label: "All Ratings",
        value: "all",
    },
    {
        label: "5 Star Ratings",
        value: "5",
    },
    {
        label: "4 Star Ratings",
        value: "4",
    },
    {
        label: "3 Star Ratings",
        value: "3",
    },
    {
        label: "2 Star Ratings",
        value: "2",
    },
    {
        label: "1 Star Ratings",
        value: "1",
    },
];

export function ReviewsSkeleton() {
    return (
        <Card className="shadow-sm w-full">
            {/* Header Skeleton */}
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle className="text-lg font-bold">Reviews</CardTitle>
                <div className="flex items-center gap-x-2">
                    {/* Button Submit Review Skeleton */}
                    <Skeleton className="h-9 w-28" />
                    {/* Select Filter Skeleton */}
                    <Skeleton className="h-9 w-30" />
                </div>
            </CardHeader>

            {/* Content Skeleton */}
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Bên trái: Danh sách các item review đang loading (Giả lập 3 items) */}
                    <div className="md:col-span-2 order-2 md:order-1 space-y-4">
                        {[...Array(4)].map((_, idx) => (
                            <div key={idx} className="p-4 rounded-lg border bg-card shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Skeleton */}
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            {/* Tên User */}
                                            <Skeleton className="h-4 w-32" />
                                            {/* Badge Sao + Date */}
                                            <div className="flex items-center gap-x-2">
                                                <Skeleton className="h-5 w-12 rounded" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Icon Action (Flag hoặc Edit) */}
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                                {/* Nội dung comment phản hồi */}
                                <div className="space-y-2 pt-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[90%]" />
                                </div>
                                {/* Like / Dislike buttons */}
                                <div className="mt-4 flex gap-4 pt-1">
                                    <Skeleton className="h-8 w-12" />
                                    <Skeleton className="h-8 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bên phải: Hộp thống kê tiến trình sao (Sticky) */}
                    <div className="space-y-6 order-1 md:order-2">
                        <div className="p-6 border rounded-xl sticky top-6 space-y-4">
                            {/* Điểm số trung bình tổng quan */}
                            <div className="flex flex-col items-center gap-2 mb-4">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            {/* 5 dòng Progress bar đại diện cho 5 mức sao */}
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-2 flex-1" />
                                        <Skeleton className="h-4 w-8" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export const ReviewSection = ({ storeId, productId, currentUser }: ReviewSectionProps) => {
    const { onOpen } = useReviewModal();

    const [reviewsFilter, setReviewsFilter] = useReviewsFilter();

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        orpc.customer.getReviews.infiniteOptions({
            input: (pageParam: ReviewCursor | undefined) => ({
                storeId,
                productId,
                rating: reviewsFilter.rating,
                limit: DEFAULT_LIMIT,
                cursor: pageParam,
            }),
            initialPageParam: undefined,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            staleTime: 10000,
        }),
    );

    const { data: initialData } = useQuery({
        ...orpc.customer.getReview.queryOptions({ input: { storeId, productId } }),
        enabled: !!currentUser,
    });

    const reviews = useMemo(() => {
        return data.pages.flatMap((page) => page.items);
    }, [data]);

    const rating = useMemo(() => {
        const totalReview = reviews.length;
        if (totalReview === 0) return 0;

        const totalRating = reviews.reduce((curr, item) => curr + item.rating, 0);
        return totalRating / totalReview;
    }, [reviews]);

    const reviewProgress = useMemo(() => {
        const oneStar = reviews.filter((rev) => rev.rating === 1).length;
        const twoStar = reviews.filter((rev) => rev.rating === 2).length;
        const threeStar = reviews.filter((rev) => rev.rating === 3).length;
        const fourStar = reviews.filter((rev) => rev.rating === 4).length;
        const fiveStar = reviews.filter((rev) => rev.rating === 5).length;

        return [fiveStar, fourStar, threeStar, twoStar, oneStar];
    }, [reviews]);

    const reviewsDataFormatted = useMemo(() => {
        if (currentUser) {
            const currentReview = reviews.find((rev) => rev.userId === currentUser.id);
            if (currentReview) {
                const otherReviews = reviews.filter((rev) => rev.userId !== currentUser.id);
                return [currentReview, ...otherReviews];
            }
        }
        return reviews;
    }, [currentUser, reviews]);

    return (
        <>
            <ReviewModal initialData={initialData} storeId={storeId} productId={productId} />
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-lg font-bold">Reviews</CardTitle>
                    <div className="flex items-center gap-x-2">
                        <Button onClick={onOpen} variant="outline" size="sm" className={cn("gap-2", initialData && "hidden")}>
                            <PlusCircleIcon className="w-4 h-4" /> Submit Review
                        </Button>
                        <Select
                            name="filter-review"
                            value={reviewsFilter.rating}
                            onValueChange={(val) => {
                                setReviewsFilter({ rating: val as ReviewsFilter });
                            }}
                        >
                            <SelectTrigger className="min-w-30" id="select-sort">
                                <SelectValue defaultValue="all" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                                {ratingOptions.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 order-2 md:order-1 space-y-4">
                            {reviewsDataFormatted.length === 0 && <NoResults icon={MessageSquareIcon} topic="reviews" />}
                            {reviewsDataFormatted.map((rev) => (
                                <ReviewItem key={rev.id} data={rev} storeId={storeId} productId={productId} currentUser={currentUser} />
                            ))}
                            {reviewsDataFormatted.length >= DEFAULT_LIMIT && (
                                <InfiniteScroll
                                    isManual
                                    hasNextPage={hasNextPage}
                                    isFetchingNextPage={isFetchingNextPage}
                                    fetchNextPage={fetchNextPage}
                                />
                            )}
                        </div>

                        <div className="space-y-6 order-1 md:order-2">
                            <div className="p-6 border rounded-xl sticky top-6">
                                <div className="flex flex-col items-center gap-2 mb-4">
                                    <div className="flex items-center gap-2">
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
                                        <span className="font-bold text-2xl">{rating}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">(Based on {formatNumber(reviewsDataFormatted.length)} reviews)</p>
                                </div>
                                <div className="space-y-3">
                                    {reviewProgress.map((pct, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <div className="w-8 text-sm flex items-center gap-x-1">
                                                {5 - i} <Star className="size-4 fill-amber-400 text-amber-400" />{" "}
                                            </div>
                                            <Progress
                                                value={reviewsDataFormatted.length > 0 ? (pct / reviewsDataFormatted.length) * 100 : 0}
                                                className="h-1.5"
                                            />
                                            <span className="w-8 text-right">
                                                {reviewsDataFormatted.length > 0 ? (pct / reviewsDataFormatted.length) * 100 : 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
