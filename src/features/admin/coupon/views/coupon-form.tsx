/* eslint-disable react/no-children-prop */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { orpc } from "@/orpc/orpc-rq.client";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formCouponSchema } from "../schemas";
import { useConfirm } from "@/hooks/use-confirm";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusCircleIcon, PlusIcon, RefreshCcwIcon, TrashIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { formatPrice, generateRandomCode, cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Hint } from "@/components/hint";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface CouponFormProps {
    couponId: string;
    storeId: string;
}

export const CouponForm = ({ storeId, couponId }: CouponFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.coupons.getOne.queryOptions({
            input: { id: couponId, storeId },
        }),
    );

    const { data: promotions } = useSuspenseQuery(orpc.promotions.getManyWithCouponMode.queryOptions({ input: { storeId } }));

    const [promotionPercentage, promotionFixed] = useMemo(() => {
        const promotionsFormatted = promotions.map((promotion) => ({
            label: {
                isActive: promotion.isActive,
                value: promotion.value,
                name: promotion.name,
                type: promotion.type,
            },
            value: promotion.id,
        }));
        const promotionPercentage = promotionsFormatted.filter((promotion) => promotion.label.type === "PERCENT");
        const promotionFixed = promotionsFormatted.filter((promotion) => promotion.label.type === "FIXED");
        return [promotionPercentage, promotionFixed];
    }, [promotions]);

    const [toggleDisplayLimitCode, setToggleDisplayLimitCode] = useState(!!initialData?.usageLimit);

    const [toggleDisplayUserLimitCode, setToggleDisplayUserLimitCode] = useState(!!initialData?.perUserLimit);

    const create = useMutation(
        orpc.coupons.create.mutationOptions({
            onSuccess: () => {
                toast.success("Coupon created");
                queryClient.invalidateQueries(
                    orpc.coupons.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/coupons`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.coupons.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Coupon updated");
                queryClient.invalidateQueries(
                    orpc.coupons.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.coupons.getOne.queryOptions({
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
        orpc.coupons.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Coupon deleted");
                queryClient.invalidateQueries(
                    orpc.coupons.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/coupons`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            promotionId: initialData?.promotionId || "",
            code: initialData?.code || "",
            usageLimit: initialData?.usageLimit || null,
            perUserLimit: initialData?.perUserLimit || null,
        },
        validators: {
            onSubmit: formCouponSchema,
        },
        onSubmit: async ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: couponId,
                    storeId,
                    ...value,
                });
            } else {
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

        await remove.mutateAsync({ id: couponId, storeId });
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this coupon");

    const actionLabel = initialData ? "Save changes" : "Create";

    const isFirstRenderLimitCode = useRef(true);
    const isFirstRenderUserLimitCode = useRef(true);

    useEffect(() => {
        if (isFirstRenderLimitCode.current) {
            isFirstRenderLimitCode.current = false;
            return;
        }

        if (!toggleDisplayLimitCode) {
            form.setFieldValue("usageLimit", null);
        } else {
            const currentValueLimit = initialData?.usageLimit || form.getFieldValue("usageLimit");
            if (!currentValueLimit) {
                form.setFieldValue("usageLimit", 1);
            } else {
                form.setFieldValue("usageLimit", currentValueLimit);
            }
        }
    }, [toggleDisplayLimitCode]);

    useEffect(() => {
        if (isFirstRenderUserLimitCode.current) {
            isFirstRenderUserLimitCode.current = false;
            return;
        }

        if (!toggleDisplayUserLimitCode) {
            form.setFieldValue("perUserLimit", null);
        } else {
            const currentValueUserLimit = initialData?.perUserLimit || form.getFieldValue("perUserLimit");
            if (!currentValueUserLimit) {
                form.setFieldValue("perUserLimit", 1);
            } else {
                form.setFieldValue("perUserLimit", currentValueUserLimit);
            }
        }
    }, [toggleDisplayUserLimitCode]);

    const handleRandomCode = () => {
        const couponCode = generateRandomCode();
        form.setFieldValue("code", couponCode);
    };

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <BreadcrumbHeader id={couponId} storeId={storeId} name={initialData?.code || "New"} topic="coupons" />
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
                        <div className="w-full md:max-w-[60%] flex items-center justify-between gap-6">
                            <div className="flex-1 max-w-70">
                                <form.Field
                                    name="code"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Coupon code</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        type="text"
                                                        placeholder="SUMMER2026"
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        autoComplete="off"
                                                        className="uppercase"
                                                    />
                                                    <InputGroupAddon align="inline-end">
                                                        <InputGroupButton
                                                            title="Generate code"
                                                            aria-label="Generate code"
                                                            onClick={handleRandomCode}
                                                            size="icon-xs"
                                                        >
                                                            <RefreshCcwIcon className="text-muted-foreground" />
                                                        </InputGroupButton>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex-1 max-w-70">
                                <form.Field
                                    name="promotionId"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Promotion</FieldLabel>
                                                <div className="flex items-center justify-start gap-2">
                                                    <Select name={field.name} value={field.state.value} onValueChange={field.handleChange}>
                                                        <SelectTrigger id="select-promotion" aria-invalid={isInvalid} className="w-full">
                                                            <SelectValue placeholder="Select promotion" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectGroup>
                                                                <SelectLabel>Percentage</SelectLabel>
                                                                {promotionPercentage.map((item) => (
                                                                    <SelectItem key={item.value} value={item.value}>
                                                                        <div className="flex items-center gap-x-3">
                                                                            <div
                                                                                className={cn(
                                                                                    "h-3 w-3 rounded-full border ml-auto",
                                                                                    item.label.isActive ? "bg-green-600" : "bg-red-600",
                                                                                )}
                                                                            />

                                                                            <p className="text-sm line-clamp-1">
                                                                                {item.label.name}{" "}
                                                                                <span className="text-xs text-neutral-500">
                                                                                    ({item.label.value}%)
                                                                                </span>
                                                                            </p>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                            <SelectSeparator />
                                                            <SelectGroup>
                                                                <SelectLabel>Fixed</SelectLabel>
                                                                {promotionFixed.map((item) => (
                                                                    <SelectItem key={item.value} value={item.value}>
                                                                        <div className="flex items-center gap-x-3">
                                                                            <div
                                                                                className={cn(
                                                                                    "h-3 w-3 rounded-full border ml-auto",
                                                                                    item.label.isActive ? "bg-green-600" : "bg-red-600",
                                                                                )}
                                                                            />

                                                                            <p className="text-sm line-clamp-1">
                                                                                {item.label.name}{" "}
                                                                                <span className="text-xs text-neutral-500">
                                                                                    ({formatPrice(item.label.value)})
                                                                                </span>
                                                                            </p>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    {promotions.length === 0 && (
                                                        <Hint text="Add promotion">
                                                            <Button
                                                                size="icon-sm"
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => router.push(`/admin/${storeId}/promotions/new`)}
                                                            >
                                                                <PlusCircleIcon className="size-4" />
                                                            </Button>
                                                        </Hint>
                                                    )}
                                                </div>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="flex w-full md:max-w-[60%] items-center justify-between gap-6">
                            <div className="flex-1 max-w-70">
                                <form.Field
                                    name="usageLimit"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <div className="flex items-center justify-between gap-x-2">
                                                    <FieldLabel htmlFor={field.name}>
                                                        Limit code{" "}
                                                        <Badge variant={toggleDisplayLimitCode ? "default" : "secondary"}>
                                                            {toggleDisplayLimitCode ? "On" : "Off"}
                                                        </Badge>
                                                    </FieldLabel>
                                                    <Switch size="sm" checked={toggleDisplayLimitCode} onCheckedChange={setToggleDisplayLimitCode} />
                                                </div>
                                                {toggleDisplayLimitCode ? (
                                                    <div>
                                                        <ButtonGroup>
                                                            <Input
                                                                id={field.name}
                                                                name={field.name}
                                                                value={field.state.value || 1}
                                                                onBlur={field.handleBlur}
                                                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                                                aria-invalid={isInvalid}
                                                                autoComplete="off"
                                                                type="number"
                                                                className="h-auto max-h-7 [appearance:textfield]"
                                                                min={1}
                                                                step={1}
                                                            />
                                                            <Button
                                                                onClick={() => {
                                                                    const currentValue = Number(field.state.value) || 1;
                                                                    const nextValue = currentValue - 1;
                                                                    form.setFieldValue("usageLimit", Math.max(1, nextValue));
                                                                }}
                                                                disabled={field.state.value === 1}
                                                                variant="outline"
                                                                type="button"
                                                                size="icon-sm"
                                                            >
                                                                <MinusIcon />
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    const currentValue = Number(field.state.value) || 1;
                                                                    const nextValue = currentValue + 1;
                                                                    form.setFieldValue("usageLimit", nextValue);
                                                                }}
                                                                variant="outline"
                                                                type="button"
                                                                size="icon-sm"
                                                            >
                                                                <PlusIcon />
                                                            </Button>
                                                        </ButtonGroup>
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            className="h-auto max-h-7"
                                                            disabled
                                                            placeholder="Unlimited"
                                                        />
                                                        <FieldDescription>
                                                            There is no limit to the number of times this code can be used.
                                                        </FieldDescription>
                                                    </div>
                                                )}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex-1 max-w-70">
                                <form.Field
                                    name="perUserLimit"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <div className="flex items-center justify-between gap-x-2">
                                                    <FieldLabel htmlFor={field.name}>
                                                        User limit code{" "}
                                                        <Badge variant={toggleDisplayUserLimitCode ? "default" : "secondary"}>
                                                            {toggleDisplayUserLimitCode ? "On" : "Off"}
                                                        </Badge>
                                                    </FieldLabel>
                                                    <Switch
                                                        size="sm"
                                                        checked={toggleDisplayUserLimitCode}
                                                        onCheckedChange={setToggleDisplayUserLimitCode}
                                                    />
                                                </div>
                                                {toggleDisplayUserLimitCode ? (
                                                    <div>
                                                        <ButtonGroup>
                                                            <Input
                                                                id={field.name}
                                                                name={field.name}
                                                                value={field.state.value || 1}
                                                                onBlur={field.handleBlur}
                                                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                                                aria-invalid={isInvalid}
                                                                autoComplete="off"
                                                                type="number"
                                                                className="h-auto max-h-7 [appearance:textfield]"
                                                                min={1}
                                                                step={1}
                                                            />
                                                            <Button
                                                                onClick={() => {
                                                                    const currentValue = Number(field.state.value) || 1;
                                                                    const nextValue = currentValue - 1;
                                                                    form.setFieldValue("perUserLimit", Math.max(1, nextValue));
                                                                }}
                                                                variant="outline"
                                                                type="button"
                                                                size="icon-sm"
                                                                disabled={field.state.value === 1}
                                                            >
                                                                <MinusIcon />
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    const currentValue = Number(field.state.value) || 1;
                                                                    const nextValue = currentValue + 1;
                                                                    form.setFieldValue("perUserLimit", nextValue);
                                                                }}
                                                                variant="outline"
                                                                type="button"
                                                                size="icon-sm"
                                                            >
                                                                <PlusIcon />
                                                            </Button>
                                                        </ButtonGroup>
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            className="h-auto max-h-7"
                                                            disabled
                                                            placeholder="Unlimited"
                                                        />
                                                        <FieldDescription>
                                                            There is no limit to the number of times a user can use this code.
                                                        </FieldDescription>
                                                    </div>
                                                )}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
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
