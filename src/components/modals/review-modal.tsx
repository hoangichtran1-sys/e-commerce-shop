/* eslint-disable react/no-children-prop */
"use client";

import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, useStore } from "@tanstack/react-form";
import { cn, getErrorCode } from "@/lib/utils";

import { ResponsiveModal } from "../responsive-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { useStoreSlug } from "@/features/customer/hooks/use-store-slug";
import { GetReview } from "@/features/customer/types";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "../ui/input-group";

interface ReviewModalProps {
    productId: string;
    storeId: string;
    isOpen: boolean;
    onClose: () => void;
    initialData?: GetReview;
}

const formSchema = z.object({
    rating: z.number().int().min(1).max(5),
    feedback: z.string().trim().max(1000).nullable(),
});

export const ReviewModal = ({ isOpen, onClose, productId, storeId, initialData }: ReviewModalProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const router = useRouter();
    const storeSlug = useStoreSlug();
    const queryClient = useQueryClient();

    const create = useMutation(
        orpc.customer.insertReview.mutationOptions({
            onSuccess: () => {
                toast.success("Thank you your feedback");
                queryClient.invalidateQueries(orpc.customer.getProduct.queryOptions({ input: { storeId, productId } }));
                onClose();
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
    const update = useMutation(
        orpc.customer.updateReview.mutationOptions({
            onSuccess: (data) => {
                toast.success("Your feedback edited");
                queryClient.invalidateQueries(orpc.customer.getProduct.queryOptions({ input: { storeId, productId } }));
                queryClient.invalidateQueries(orpc.customer.getReview.queryOptions({ input: { storeId: data.storeId, productId: data.productId } }));
                onClose();
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const isEdit = !!initialData?.id;

    useEffect(() => {
        if (!isOpen) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRating(initialData?.rating || 0);
    }, [isOpen, initialData]);

    const form = useForm({
        defaultValues: {
            rating: initialData?.rating || 0,
            feedback: initialData?.feedback || null,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: ({ value }) => {
            if (isEdit) {
                update.mutate({
                    storeId,
                    productId,
                    ...value,
                });
            } else {
                create.mutate({
                    storeId,
                    productId,
                    ...value,
                });
            }
        },
    });

    const feedback = useStore(form.store, (state) => state.values.feedback);

    return (
        <ResponsiveModal
            isSeparator={true}
            title="How was your experience?"
            description="Please rate your experience and share any additional feedback."
            onClose={onClose}
            isOpen={isOpen}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <FieldGroup>
                    <div className="space-y-2">
                        <form.Field
                            name="rating"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Rating</FieldLabel>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    className="transition-transform hover:scale-110"
                                                    key={star}
                                                    onClick={() => {
                                                        setRating(star);
                                                        form.setFieldValue("rating", star);
                                                    }}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    type="button"
                                                >
                                                    <StarIcon
                                                        className={cn(
                                                            "h-8 w-8 transition-colors",
                                                            (hoverRating || rating) >= star
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-muted-foreground",
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <form.Field
                            name="feedback"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Additional feedback (optional)</FieldLabel>
                                        <InputGroup>
                                            <InputGroupTextarea
                                                className="min-h-36"
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ""}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                                placeholder="Tell us more about your experience..."
                                                aria-invalid={isInvalid}
                                            />
                                            <InputGroupAddon align="block-end">
                                                <InputGroupText>{feedback ? feedback.trim().length : 0}/1000</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>

                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                    </div>
                </FieldGroup>
                <form.Subscribe
                    selector={(state) => [state.isDirty]}
                    children={([isDirty]) => {
                        const isDisabled = initialData ? !isDirty || update.isPending : create.isPending;

                        return (
                            <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                                <Button onClick={onClose} disabled={isDisabled} variant="outline" className="w-full lg:w-auto" type="button">
                                    Cancel
                                </Button>
                                <Button disabled={isDisabled} type="submit" className="w-full lg:w-auto">
                                    Confirm
                                </Button>
                            </div>
                        );
                    }}
                />
            </form>
        </ResponsiveModal>
    );
};
