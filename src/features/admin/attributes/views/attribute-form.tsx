/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, PaletteIcon, RulerIcon, ShirtIcon, TrashIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InputColor } from "@/components/input-color";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { TokenInput } from "@/components/token-input";
import { AttributeType } from "@/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalizeFirst } from "@/lib/utils";
import { useState } from "react";
import { Label } from "@/components/ui/label";

const attributeTypeOptions = [
    {
        label: "Color",
        value: AttributeType.COLOR,
        icon: PaletteIcon,
    },
    {
        label: "Size",
        value: AttributeType.SIZE,
        icon: RulerIcon,
    },
    {
        label: "Material",
        value: AttributeType.MATERIAL,
        icon: ShirtIcon,
    },
];

const ATTRIBUTE_SUGGESTIONS: Record<AttributeType, string[]> = {
    [AttributeType.SIZE]: ["S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42"],
    [AttributeType.COLOR]: ["red", "white", "green", "black", "gray", "yellow", "pink", "purple"],
    [AttributeType.MATERIAL]: ["Cotton", "Kaki", "Jean", "Wool", "Silk", "Leather"],
};

interface AttributeFormProps {
    attributeId: string;
    storeId: string;
}

const formSchema = z.object({
    name: z.string().min(1),
    values: z.array(z.string()).min(1),
    type: z.enum(AttributeType),
});

export const AttributeForm = ({ storeId, attributeId }: AttributeFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [colorValue, setColorValue] = useState("#000000");

    const { data: initialData } = useSuspenseQuery(
        orpc.attributes.getOne.queryOptions({
            input: { id: attributeId, storeId },
        }),
    );

    const create = useMutation(
        orpc.attributes.create.mutationOptions({
            onSuccess: () => {
                toast.success("Attribute created");
                queryClient.invalidateQueries(
                    orpc.attributes.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/attributes`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.attributes.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Attribute updated");
                queryClient.invalidateQueries(
                    orpc.attributes.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.attributes.getOne.queryOptions({
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
        orpc.attributes.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Attribute deleted");
                queryClient.invalidateQueries(
                    orpc.attributes.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/attributes`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: initialData?.name || "",
            values: initialData?.values.map((val) => val.value) || [],
            type: initialData?.type || AttributeType.COLOR,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: attributeId,
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

        await remove.mutateAsync({ id: attributeId, storeId });
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this attribute");

    const actionLabel = initialData ? "Save changes" : "Create";

    const currentType = useStore(form.store, (state) => state.values.type);
    const currentValues = useStore(form.store, (state) => state.values.values);

    const suggestions = ATTRIBUTE_SUGGESTIONS[currentType] || [];

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <BreadcrumbHeader id={attributeId} storeId={storeId} name={initialData?.name || "New"} topic="attributes" />
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
                        <div className="w-full flex items-center justify-start gap-x-10">
                            <div className="flex-1 max-w-60">
                                <form.Field
                                    name="name"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                                <Input
                                                    type="text"
                                                    placeholder="Color name"
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
                            <div className="flex-1 max-w-60">
                                <form.Field
                                    name="type"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                                                <div className="flex items-center justify-start gap-2">
                                                    <Select
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onValueChange={(val) => {
                                                            field.handleChange(val as AttributeType);
                                                            form.setFieldValue("values", []);
                                                        }}
                                                    >
                                                        <SelectTrigger className="min-w-60" id="select-status" aria-invalid={isInvalid}>
                                                            <SelectValue defaultValue={AttributeType.COLOR} />
                                                        </SelectTrigger>
                                                        <SelectContent position="item-aligned">
                                                            {attributeTypeOptions.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    <div className="flex items-center gap-x-2">
                                                                        <item.icon className="size-3" />
                                                                        <span className="text-xs font-medium">{item.label}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
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
                        <div className="flex md:flex-row flex-col justify-between max-w-[60%] gap-6">
                            <form.Field
                                name="values"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    const currentValues = field.state.value || [];

                                    const handleToggleSuggestion = (val: string) => {
                                        if (currentValues.includes(val)) {
                                            // Nếu có rồi thì lọc bỏ đi (xóa)
                                            field.handleChange(currentValues.filter((v: string) => v !== val));
                                        } else {
                                            // Nếu chưa có thì add thêm vào mảng
                                            field.handleChange([...currentValues, val]);
                                        }
                                    };

                                    return (
                                        <div className="w-full flex md:flex-row flex-col items-start gap-6">
                                            <div className="flex-1 w-full">
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Values</FieldLabel>
                                                    <TokenInput
                                                        placeholder="Select or Enter value"
                                                        value={currentValues}
                                                        onChange={(values) => field.handleChange(values)}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            </div>

                                            {/* CỘT BÊN PHẢI: CARD HIỂN THỊ OPTION GỢI Ý ĐỘNG */}
                                            <div className="flex-1 max-w-200 w-full">
                                                <Card className="h-full">
                                                    <CardHeader>
                                                        <CardTitle className="text-sm font-medium">
                                                            Suggestions for {capitalizeFirst(currentType as string)}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {suggestions.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground italic">
                                                                Select the type of attribute to see suggestions.{" "}
                                                            </p>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2">
                                                                {suggestions.map((suggestion) => {
                                                                    const isSelected = currentValues.includes(suggestion);
                                                                    return (
                                                                        <Button
                                                                            key={suggestion}
                                                                            type="button"
                                                                            variant={isSelected ? "default" : "outline"}
                                                                            size="sm"
                                                                            className="h-8 gap-1 transition-all"
                                                                            onClick={() => handleToggleSuggestion(suggestion)}
                                                                        >
                                                                            {isSelected && <CheckIcon className="h-3 w-3" />}
                                                                            {suggestion}
                                                                        </Button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                            {currentType === "COLOR" && (
                                <div className="max-w-60 ml-12">
                                    <div className="flex flex-col gap-y-4 mt-6">
                                        <Label>Option select color hex</Label>
                                        <InputColor
                                            onBlur={() => {}}
                                            label=""
                                            className="mt-0"
                                            value={colorValue}
                                            onChange={(val) => {
                                                setColorValue(val);
                                                form.setFieldValue("values", [...new Set([...currentValues, val])]);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </FieldGroup>
                </div>
                <form.Subscribe
                    selector={(state) => [state.isDirty]}
                    children={([isDirty]) => {
                        const isDisabled = initialData ? !isDirty || edit.isPending : create.isPending;

                        return (
                            <Button disabled={isDisabled || remove.isPending} type="submit" className="ml-auto">
                                {actionLabel}
                            </Button>
                        );
                    }}
                />
            </form>
        </>
    );
};
