/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-children-prop */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formPromotionSchema } from "../schemas";
import { PromotionMode, PromotionType } from "@/generated/prisma/enums";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MultipleSelect } from "@/components/multiple-select";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { add } from "date-fns";

interface PromotionFormProps {
    promotionId: string;
    storeId: string;
}

export const PromotionForm = ({ storeId, promotionId }: PromotionFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.promotions.getOne.queryOptions({
            input: { id: promotionId, storeId },
        }),
    );

    const { data: categories } = useSuspenseQuery(orpc.categories.getMany.queryOptions({ input: { storeId } }));

    const categoriesFormatted = categories.map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const initialDate =
            initialData && initialData.startAt && initialData.endAt ? { from: initialData.startAt, to: initialData.endAt } : undefined;

        return initialDate;
    });

    const [toggleDisplayDiscount, setToggleDisplayDiscount] = useState(!!initialData?.maxDiscountValue);

    const create = useMutation(
        orpc.promotions.create.mutationOptions({
            onSuccess: () => {
                toast.success("Promotion created");
                queryClient.invalidateQueries(
                    orpc.promotions.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/promotions`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.promotions.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Promotion updated");
                queryClient.invalidateQueries(
                    orpc.promotions.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.promotions.getOne.queryOptions({
                        input: { id: data.id, storeId },
                    }),
                );
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const remove = useMutation(
        orpc.promotions.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Promotion deleted");
                queryClient.invalidateQueries(
                    orpc.promotions.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/promotions`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: initialData?.name || "",
            value: initialData?.value ? initialData.value : 0,
            type: initialData?.type || PromotionType.FIXED,
            mode: initialData?.mode || PromotionMode.COUPON,
            categoryIds: (initialData?.categories ?? []).map((category) => category.id),
            startAt: initialData?.startAt || new Date(),
            endAt:
                initialData?.endAt ||
                add(new Date(), {
                    days: 7,
                }),
            minOrderValue: initialData?.minOrderValue || 0,
            maxDiscountValue: initialData?.maxDiscountValue || null,
            isActive: !!initialData?.isActive,
        },
        validators: {
            onSubmit: formPromotionSchema,
        },
        onSubmit: async ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: promotionId,
                    storeId,
                    ...value,
                });
            } else {
                console.log(value);
                create.mutate({
                    storeId,
                    ...value,
                });
            }
        },
    });

    const handleRemove = async () => {
        const ok = await confirmRemove();
        if (!ok) return;

        await remove.mutateAsync({ id: promotionId, storeId });
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this promotion");

    const handleChangeDuration = useCallback(
        (dateRange: DateRange | undefined) => {
            setDateRange(dateRange);
            form.setFieldValue("startAt", dateRange?.from ?? new Date());
            form.setFieldValue(
                "endAt",
                dateRange?.to ??
                    add(new Date(), {
                        days: 7,
                    }),
            );
        },
        [form],
    );

    const actionLabel = initialData ? "Save changes" : "Create";

    const type = useStore(form.store, (state) => state.values.type);
    const value = useStore(form.store, (state) => state.values.value);
    const mode = useStore(form.store, (state) => state.values.mode);

    const isFirstRenderDiscount = useRef(true);

    useEffect(() => {
        if (isFirstRenderDiscount.current) {
            isFirstRenderDiscount.current = false;
            return;
        }

        if (!toggleDisplayDiscount) {
            form.setFieldValue("maxDiscountValue", null);
        } else {
            const currentValue = initialData?.maxDiscountValue || form.getFieldValue("maxDiscountValue");
            if (!currentValue) {
                form.setFieldValue("maxDiscountValue", 0.01);
            } else {
                form.setFieldValue("maxDiscountValue", currentValue);
            }
        }
    }, [toggleDisplayDiscount]);

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <BreadcrumbHeader id={promotionId} storeId={storeId} name={initialData?.name || "New"} topic="promotions" />
                {initialData && (
                    <Button variant="destructive" size="sm" disabled={edit.isPending || remove.isPending} onClick={handleRemove}>
                        <TrashIcon className="size-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
                className="space-y-8 w-full"
            >
                <div className="grid md:grid-cols-3 grid-cols-1 gap-8">
                    <FieldGroup className="col-span-3">
                        <div className="w-full flex items-center justify-between gap-x-6">
                            <div className="flex-1 max-w-full">
                                <form.Field
                                    name="mode"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <FieldSet>
                                                <FieldLegend>Mode</FieldLegend>
                                                <RadioGroup
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        const nextMode = value as PromotionMode;
                                                        field.handleChange(nextMode);
                                                        if (nextMode === "CATEGORY_CAMPAIGN") {
                                                            form.setFieldValue("type", "PERCENT");
                                                        }
                                                    }}
                                                >
                                                    <FieldLabel htmlFor="coupon">
                                                        <Field orientation="horizontal" data-invalid={isInvalid}>
                                                            <FieldContent>
                                                                <FieldTitle>Coupon</FieldTitle>
                                                                <FieldDescription>Applies to all eligible products with coupon</FieldDescription>
                                                            </FieldContent>
                                                            <RadioGroupItem value={PromotionMode.COUPON} id="coupon" aria-invalid={isInvalid} />
                                                        </Field>
                                                    </FieldLabel>
                                                    <FieldLabel htmlFor="category_campaign">
                                                        <Field orientation="horizontal" data-invalid={isInvalid}>
                                                            <FieldContent>
                                                                <FieldTitle>Specific categories</FieldTitle>
                                                                <FieldDescription>
                                                                    Applicable to advertising campaigns for specific category groups
                                                                </FieldDescription>
                                                            </FieldContent>
                                                            <RadioGroupItem
                                                                value={PromotionMode.CATEGORY_CAMPAIGN}
                                                                id="category_campaign"
                                                                aria-invalid={isInvalid}
                                                            />
                                                        </Field>
                                                    </FieldLabel>
                                                </RadioGroup>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </FieldSet>
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex-1 max-w-full">
                                <form.Field
                                    name="type"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <FieldSet>
                                                <FieldLegend>
                                                    Type{" "}
                                                    {mode === "CATEGORY_CAMPAIGN" && (
                                                        <span className="text-neutral-600 text-xs">(Required use type PERCENTAGE)</span>
                                                    )}
                                                </FieldLegend>
                                                <RadioGroup
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onValueChange={(value) => {
                                                        field.handleChange(value as PromotionType);
                                                        if (value === "FIXED") {
                                                            form.setFieldValue("value", 0.01);
                                                            form.setFieldValue("minOrderValue", 0);
                                                            form.setFieldValue("maxDiscountValue", null);
                                                        } else if (value === "PERCENT") {
                                                            form.setFieldValue("value", 1);
                                                            form.setFieldValue("minOrderValue", 0);
                                                        }
                                                    }}
                                                >
                                                    <FieldLabel htmlFor="percentage">
                                                        <Field orientation="horizontal" data-invalid={isInvalid}>
                                                            <FieldContent>
                                                                <FieldTitle>Percentage discount</FieldTitle>
                                                                <FieldDescription>e.g. 10% off (can set max discount)</FieldDescription>
                                                            </FieldContent>
                                                            <RadioGroupItem value={PromotionType.PERCENT} id="percentage" aria-invalid={isInvalid} />
                                                        </Field>
                                                    </FieldLabel>
                                                    <FieldLabel htmlFor="fixed">
                                                        <Field
                                                            orientation="horizontal"
                                                            data-invalid={isInvalid}
                                                            data-disabled={mode === "CATEGORY_CAMPAIGN"}
                                                        >
                                                            <FieldContent>
                                                                <FieldTitle>Fixed amount</FieldTitle>
                                                                <FieldDescription>e.g. $50 off</FieldDescription>
                                                            </FieldContent>
                                                            <RadioGroupItem
                                                                value={PromotionType.FIXED}
                                                                id="fixed"
                                                                aria-invalid={isInvalid}
                                                                disabled={mode === "CATEGORY_CAMPAIGN"}
                                                            />
                                                        </Field>
                                                    </FieldLabel>
                                                </RadioGroup>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </FieldSet>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="flex w-full max-w-[60%] items-center justify-between gap-6">
                            <div className="flex-1">
                                <form.Field
                                    name="name"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                                <Input
                                                    type="text"
                                                    placeholder="Promotion name"
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    autoComplete="off"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <form.Field
                                    name="value"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Value</FieldLabel>
                                                <InputGroup className="bg-background">
                                                    <InputGroupAddon>
                                                        {type === "FIXED" && <Label htmlFor="fixed">$</Label>}
                                                        {type === "PERCENT" && <Label htmlFor="fixed">%</Label>}
                                                    </InputGroupAddon>
                                                    {type === "FIXED" && (
                                                        <InputGroupInput
                                                            type="number"
                                                            min={0}
                                                            step={0.01}
                                                            placeholder="50"
                                                            id={field.name}
                                                            name={field.name}
                                                            value={field.state.value}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                                            aria-invalid={isInvalid}
                                                            autoComplete="off"
                                                        />
                                                    )}
                                                    {type === "PERCENT" && (
                                                        <InputGroupInput
                                                            type="number"
                                                            min={1}
                                                            max={100}
                                                            step={1}
                                                            placeholder="50"
                                                            id={field.name}
                                                            name={field.name}
                                                            value={field.state.value}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                                            aria-invalid={isInvalid}
                                                            autoComplete="off"
                                                        />
                                                    )}
                                                </InputGroup>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="flex w-full max-w-[60%] items-center justify-between gap-6">
                            <div className="flex-1 md:max-w-[50%]">
                                <form.Field
                                    name="minOrderValue"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Min Order Value
                                                    {mode === "CATEGORY_CAMPAIGN" && "(Only available for coupon promotions)"}
                                                </FieldLabel>
                                                <InputGroup className="bg-background">
                                                    <InputGroupAddon>
                                                        <Label htmlFor={field.name}>$</Label>
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        placeholder="50"
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                                        aria-invalid={isInvalid}
                                                        autoComplete="off"
                                                        disabled={mode === "CATEGORY_CAMPAIGN"}
                                                    />
                                                </InputGroup>
                                                <FieldDescription>
                                                    {type === "FIXED" && value > 0 && (
                                                        <span>
                                                            It&apos;s recommended to set a minimum order value of {formatPrice(value * 1.5)} -{" "}
                                                            {formatPrice(value * 2)} (1.5 - 2 times the discount value).
                                                        </span>
                                                    )}
                                                    {type === "PERCENT" && (
                                                        <span>
                                                            Set the price higher than thes cheapest product to avoid excessive discounts on small
                                                            orders.
                                                        </span>
                                                    )}
                                                </FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                            {type === "PERCENT" && (
                                <div className="flex-1 mb-2">
                                    <form.Field
                                        name="maxDiscountValue"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <FieldLabel htmlFor={field.name}>
                                                            Max Discount Value{" "}
                                                            <Badge variant={toggleDisplayDiscount ? "default" : "secondary"}>
                                                                {toggleDisplayDiscount ? "On" : "Off"}
                                                            </Badge>
                                                        </FieldLabel>
                                                        <Switch
                                                            size="sm"
                                                            checked={toggleDisplayDiscount}
                                                            onCheckedChange={setToggleDisplayDiscount}
                                                        />
                                                    </div>
                                                    {toggleDisplayDiscount ? (
                                                        <div>
                                                            <InputGroup className="bg-background">
                                                                <InputGroupAddon>
                                                                    <Label htmlFor={field.name}>$</Label>
                                                                </InputGroupAddon>
                                                                <InputGroupInput
                                                                    type="number"
                                                                    min={0.01}
                                                                    step={0.01}
                                                                    placeholder="50"
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.state.value || 0.01}
                                                                    onBlur={field.handleBlur}
                                                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                                                    aria-invalid={isInvalid}
                                                                    autoComplete="off"
                                                                />
                                                            </InputGroup>
                                                            <FieldDescription>
                                                                A maximum discount amount should be set to avoid budget risks when customers make
                                                                extremely large orders.
                                                            </FieldDescription>
                                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                        </div>
                                                    ) : (
                                                        <div className="mb-6">
                                                            <Input
                                                                id={field.name}
                                                                name={field.name}
                                                                className="h-auto"
                                                                disabled
                                                                placeholder="Unlimited"
                                                            />
                                                            <FieldDescription>No limit on the maximum discount value.</FieldDescription>
                                                        </div>
                                                    )}
                                                </Field>
                                            );
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="flex w-full max-w-[60%] flex-col md:flex-row md:items-center items-start justify-between gap-6">
                            {mode === "CATEGORY_CAMPAIGN" && (
                                <div className="flex-1 w-full">
                                    <form.Field
                                        name="categoryIds"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Categories</FieldLabel>
                                                    <MultipleSelect
                                                        options={categoriesFormatted}
                                                        topic="category"
                                                        selectedValues={field.state.value}
                                                        setSelectedValues={field.handleChange}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex-1 w-full">
                                <Field>
                                    <FieldLabel>Duration</FieldLabel>
                                    <DatePicker date={dateRange} setDate={handleChangeDuration} />
                                </Field>
                            </div>
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="w-full max-w-full">
                            <form.Field
                                name="isActive"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <FieldLabel htmlFor={field.name}>
                                            <Field orientation="horizontal" data-invalid={isInvalid}>
                                                <FieldContent>
                                                    <FieldTitle>Active</FieldTitle>
                                                    <FieldDescription>Turn off to disable this promotion without deleting it.</FieldDescription>
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </FieldContent>
                                                <Switch
                                                    id={field.name}
                                                    name={field.name}
                                                    checked={field.state.value}
                                                    onCheckedChange={field.handleChange}
                                                    aria-invalid={isInvalid}
                                                />
                                            </Field>
                                        </FieldLabel>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                </div>
                <form.Subscribe
                    selector={(state) => [state.isDirty]}
                    children={([isDirty]) => {
                        const isDisabled = initialData ? !isDirty || edit.isPending : create.isPending;

                        return (
                            <Button disabled={isDisabled || remove.isPending} type="submit" className="ml-auto w-full md:w-auto">
                                {actionLabel}
                            </Button>
                        );
                    }}
                />
            </form>
        </>
    );
};
