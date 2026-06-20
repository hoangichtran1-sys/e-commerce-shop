/* eslint-disable react/no-children-prop */
"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger, PopoverHeader, PopoverTitle, PopoverDescription } from "@/components/ui/popover";
import { z } from "zod";
import { useForm, useStore } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InputGroup, InputGroupTextarea, InputGroupAddon, InputGroupText } from "@/components/ui/input-group";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";

import { GetReviews } from "@/features/customer/types";
import { Edit2Icon, FlagIcon, FlagOffIcon, Star, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { User } from "@/lib/auth";
import { ReviewReportReason } from "@/generated/prisma/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useReviewsFilter } from "@/features/customer/hooks/use-reviews-filter";
import { orpc } from "@/orpc/orpc-rq.client";
import { cn, getErrorCode } from "@/lib/utils";
import { useReviewModal } from "@/features/customer/hooks/use-review-modal";

interface ReviewItemProps {
    data: GetReviews[number];
    currentUser: User | null;
    storeId: string;
    productId: string;
}

const reportOptions = [
    {
        label: "Spam",
        value: ReviewReportReason.SPAM,
    },
    {
        label: "Offensive",
        value: ReviewReportReason.OFFENSIVE,
    },
    {
        label: "Fake review",
        value: ReviewReportReason.FAKE_REVIEW,
    },
    {
        label: "Misleading",
        value: ReviewReportReason.MISLEADING,
    },
    {
        label: "Other",
        value: ReviewReportReason.OTHER,
    },
];

const formSchema = z.object({
    type: z.enum(ReviewReportReason),
    reason: z.string().min(3).max(100).nullable(),
});

export const ReviewItem = ({ data, currentUser, storeId, productId }: ReviewItemProps) => {
    const storeSlug = useStoreSlug();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { onOpen } = useReviewModal();

    const [openReport, setOpenReport] = useState(false);

    const [reviewsFilter] = useReviewsFilter();

    const createReport = useMutation(
        orpc.customer.createReport.mutationOptions({
            onSuccess: () => {
                toast.success("Report created");
                queryClient.invalidateQueries(
                    orpc.customer.getReviews.queryOptions({
                        input: {
                            storeId,
                            productId,
                            rating: reviewsFilter.rating,
                        },
                    }),
                );
                setOpenReport(false);
                form.reset();
            },
            onError: (error) => {
                const code = getErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    toast.error("Please log in to continue");
                    router.replace(`/login?redirect=/${storeSlug}/products/${productId}`);
                    return;
                }
                toast.error(error.message);
            },
        }),
    );

    const like = useMutation(
        orpc.customer.like.mutationOptions({
            onSuccess: () => {
                toast.success("You liked review");
                queryClient.invalidateQueries(
                    orpc.customer.getReviews.queryOptions({
                        input: {
                            storeId,
                            productId,
                            rating: reviewsFilter.rating,
                        },
                    }),
                );
            },
            onError: (error) => {
                const code = getErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    toast.error("Please log in to continue");
                    router.replace(`/login?redirect=/${storeSlug}/products/${productId}`);
                    return;
                }
                toast.error(error.message);
            },
        }),
    );

    const dislike = useMutation(
        orpc.customer.dislike.mutationOptions({
            onSuccess: () => {
                toast.success("You disliked review");
                queryClient.invalidateQueries(
                    orpc.customer.getReviews.queryOptions({
                        input: {
                            storeId,
                            productId,
                            rating: reviewsFilter.rating,
                        },
                    }),
                );
            },
            onError: (error) => {
                const code = getErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    toast.error("Please log in to continue");
                    router.replace(`/login?redirect=/${storeSlug}/products/${productId}`);
                    return;
                }
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            type: ReviewReportReason.SPAM as ReviewReportReason,
            reason: null as string | null,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            createReport.mutate({
                reviewId: data.id,
                ...value,
            });
        },
    });

    const type = useStore(form.store, (state) => state.values.type);
    const reason = useStore(form.store, (state) => state.values.reason);

    const isReport = data.reports.some((r) => r.userId === currentUser?.id);
    const isLiked = data.reactions.find((r) => r.userId === currentUser?.id)?.type === "LIKE";
    const isDisliked = data.reactions.find((r) => r.userId === currentUser?.id)?.type === "DISLIKE";

    const [totalLike, totalDislike] = useMemo(() => {
        const likes = data.reactions.filter((r) => r.type === "LIKE").length;
        const dislikes = data.reactions.filter((r) => r.type === "DISLIKE").length;

        return [likes, dislikes];
    }, [data]);

    if (data.isHidden) {
        return (
            <div className="rounded-md shadow-sm border p-4 text-sm text-muted-foreground italic">
                This review has been hidden due to policy violations.
            </div>
        );
    }

    return (
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    {data.user.image ? (
                        <Avatar>
                            <AvatarImage src={data.user.image} />
                        </Avatar>
                    ) : (
                        <GeneratedAvatar seed={data.user.name || data.user.email} />
                    )}
                    <div>
                        <p className="font-semibold text-sm">{data.user.name || data.user.email}</p>
                        <div className="flex items-center gap-x-2 mt-1">
                            <Badge variant="outline">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-semibold text-neutral-600">{data.rating}</span>
                                </div>
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <Hint text={format(data.createdAt, "LLL dd, y")}>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
                                </span>
                            </Hint>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-x-2">
                    {currentUser && currentUser.id === data.userId ? null : isReport ? (
                        <Hint text="You Reported">
                            <Button variant="ghost" disabled size="icon">
                                <FlagOffIcon />
                            </Button>
                        </Hint>
                    ) : (
                        <Popover onOpenChange={setOpenReport} open={openReport}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <FlagIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60" side="right">
                                <div className="grid gap-4">
                                    <PopoverHeader className="gap-2">
                                        <PopoverTitle className="leading-none">Review Report</PopoverTitle>
                                        <PopoverDescription>This commentary report.</PopoverDescription>
                                    </PopoverHeader>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            form.handleSubmit();
                                        }}
                                        className="space-y-4 w-full"
                                    >
                                        <div className="grid gap-2">
                                            <FieldGroup>
                                                <form.Field
                                                    name="type"
                                                    children={(field) => {
                                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                        return (
                                                            <>
                                                                <RadioGroup
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onValueChange={(value) => {
                                                                        field.handleChange(value as ReviewReportReason);
                                                                    }}
                                                                    defaultValue={ReviewReportReason.SPAM}
                                                                >
                                                                    {reportOptions.map((item) => (
                                                                        <Field orientation="horizontal" data-invalid={isInvalid} key={item.value}>
                                                                            <RadioGroupItem
                                                                                value={item.value}
                                                                                id={`radiogroup-${item.value}`}
                                                                                aria-invalid={isInvalid}
                                                                            />
                                                                            <FieldLabel htmlFor={`radiogroup-${item.label}`} className="font-normal">
                                                                                {item.label}
                                                                            </FieldLabel>
                                                                        </Field>
                                                                    ))}
                                                                </RadioGroup>
                                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                            </>
                                                        );
                                                    }}
                                                />
                                            </FieldGroup>
                                            {type === "OTHER" && (
                                                <FieldGroup>
                                                    <form.Field
                                                        name="reason"
                                                        children={(field) => {
                                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                            return (
                                                                <Field data-invalid={isInvalid}>
                                                                    <FieldLabel htmlFor={field.name}>
                                                                        Reason
                                                                        <span className="text-neutral-600">(optional)</span>
                                                                    </FieldLabel>
                                                                    <InputGroup>
                                                                        <InputGroupTextarea
                                                                            id={field.name}
                                                                            name={field.name}
                                                                            value={field.state.value || ""}
                                                                            onBlur={field.handleBlur}
                                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                                            aria-invalid={isInvalid}
                                                                            placeholder="Reason to report..."
                                                                        />
                                                                        <InputGroupAddon align="block-end">
                                                                            <InputGroupText>
                                                                                {reason ? reason.trim().length : 0}
                                                                                /100
                                                                            </InputGroupText>
                                                                        </InputGroupAddon>
                                                                    </InputGroup>
                                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                                </Field>
                                                            );
                                                        }}
                                                    />
                                                </FieldGroup>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-x-2">
                                            <Button type="submit" size="sm">
                                                Send Report
                                            </Button>
                                            <Button onClick={() => setOpenReport(false)} type="button" variant="outline" size="sm">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {currentUser && currentUser.id === data.userId && (
                        <Button variant="ghost" onClick={onOpen} size="icon">
                            <Edit2Icon />
                        </Button>
                    )}
                </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed line-clamp-5">&quot;{data.feedback || "No feedback"}&quot;</p>
            <div className="mt-4 flex gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => like.mutate({ reviewId: data.id })}
                    className="h-8 px-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                    aria-label="review reaction"
                >
                    <ThumbsUpIcon className={cn("size-4", isLiked && "fill-current")} />
                    <span>{totalLike}</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dislike.mutate({ reviewId: data.id })}
                    className="h-8 px-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                    aria-label="review reaction"
                >
                    <ThumbsDownIcon className={cn("size-4", isDisliked && "fill-current")} />
                    <span>{totalDislike}</span>
                </Button>
            </div>
        </div>
    );
};
