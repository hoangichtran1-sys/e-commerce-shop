import { ReviewModal } from "@/components/modals/review-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewsFilter } from "@/features/customer/types";
import { User } from "@/lib/auth";
import { Edit2Icon, FlagIcon, MessageSquareIcon, PlusCircleIcon, Star, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { orpc } from "@/orpc/orpc-rq.client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { NoResults } from "@/components/no-results";
import { Hint } from "@/components/hint";
import { format, formatDistanceToNow } from "date-fns";
import { cn, formatNumber } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReviewsFilter } from "@/features/customer/hooks/use-reviews-filter";

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

export const ReviewSection = ({ storeId, productId, currentUser }: ReviewSectionProps) => {
    const [openReviewModal, setOpenReviewModal] = useState(false);

    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);

    const [reviewsFilter, setReviewsFilter] = useReviewsFilter();

    const { data: reviews } = useSuspenseQuery(
        orpc.customer.getReviews.queryOptions({ input: { storeId, productId, rating: reviewsFilter.rating } }),
    );

    const { data: initialData } = useQuery({
        ...orpc.customer.getReview.queryOptions({ input: { storeId, productId } }),
        enabled: !!currentUser,
    });

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
            <ReviewModal
                initialData={initialData}
                storeId={storeId}
                productId={productId}
                isOpen={openReviewModal}
                onClose={() => setOpenReviewModal(false)}
            />
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-lg font-bold">Reviews</CardTitle>
                    <div className="flex items-center gap-x-2">
                        <Button onClick={() => setOpenReviewModal(true)} variant="outline" size="sm" className={cn("gap-2", initialData && "hidden")}>
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
                            {reviewsDataFormatted.map((rev) => {
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
                                                                <span className="text-xs font-semibold text-neutral-600">{rev.rating}</span>
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
                            {reviewsDataFormatted.length >= 8 && (
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
