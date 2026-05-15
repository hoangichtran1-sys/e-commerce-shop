/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { TrashIcon, PlusCircleIcon, MinusIcon, PlusIcon, RefreshCcwIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Hint } from "@/components/hint";
import { createProductSchema } from "../schemas";
import { ImageUploadProduct } from "@/components/image-upload-product";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { ProductStatus } from "@/generated/prisma/enums";
import { Switch } from "@/components/ui/switch";
import { generateSKU } from "@/lib/utils";

interface ProductFormProps {
    productId: string;
    storeId: string;
}

const statusOptions = [
    {
        label: "Draft",
        value: ProductStatus.DRAFT,
        color: "bg-orange-500",
    },
    {
        label: "Published",
        value: ProductStatus.PUBLISHED,
        color: "bg-green-500",
    },
    {
        label: "Archived",
        value: ProductStatus.ARCHIVED,
        color: "bg-blue-500",
    },
];

export const ProductForm = ({ storeId, productId }: ProductFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.products.getOne.queryOptions({
            input: { id: productId, storeId },
        }),
    );

    const { data: categories } = useSuspenseQuery(orpc.categories.getMany.queryOptions({ input: { storeId } }));

    const categoriesFormatted = categories.map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const [previews, setPreviews] = useState<string[]>(() => {
        const initialImagePreview = (initialData?.images || []).map((image) => image.url);

        return initialImagePreview;
    });

    const create = useMutation(
        orpc.products.create.mutationOptions({
            onSuccess: () => {
                toast.success("Product created");
                queryClient.invalidateQueries(
                    orpc.products.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/products`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.products.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Product updated");
                queryClient.invalidateQueries(
                    orpc.products.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.products.getOne.queryOptions({
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
        orpc.products.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Product deleted");
                queryClient.invalidateQueries(
                    orpc.products.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/products`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const upload = useMutation(
        orpc.products.upload.mutationOptions({
            onSuccess: (data) => {
                toast.success("Image uploaded");
                setPreviews((prev) => [...prev, data.url]);
                form.setFieldValue("images", [...previews, data.url]);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            categoryId: initialData?.categoryId || "",
            sizeId: initialData?.sizeId || "",
            colorId: initialData?.colorId || "",
            name: initialData?.name || "",
            sku: initialData?.sku || "",
            price: initialData?.price ? initialData.price : 0.01,
            status: initialData?.status || ProductStatus.DRAFT,
            isFeatured: !!initialData?.isFeatured,
            inStock: !!initialData?.inStock,
            images: previews || [],
            description: initialData?.description || null,
        },
        validators: {
            onSubmit: createProductSchema.omit({ storeId: true }),
        },
        onSubmit: ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: productId,
                    storeId: storeId,
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

        await remove.mutateAsync({ id: productId, storeId });
    };

    const isUploadingRef = useRef(false);

    const handleFilesUpload = useCallback(
        (newFiles: File[]) => {
            if (!isUploadingRef.current) {
                isUploadingRef.current = true;

                upload.mutate(
                    { file: newFiles[0] },
                    {
                        onSettled: () => {
                            isUploadingRef.current = false;
                        },
                    },
                );
            }
        },
        [upload],
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this product");

    const actionLabel = initialData ? "Save changes" : "Create";

    const categoryId = useStore(form.store, (state) => state.values.categoryId);
    const name = useStore(form.store, (state) => state.values.name);

    const { data: sizes } = useQuery({
        ...orpc.sizes.getManyByStoreAndCategory.queryOptions({
            input: { storeId, categoryId },
        }),
        enabled: !!categoryId,
    });
    const { data: colors } = useQuery({
        ...orpc.colors.getManyByStoreAndCategory.queryOptions({
            input: { storeId, categoryId },
        }),
        enabled: !!categoryId,
    });

    const sizesFormatted = (sizes ?? []).map((size) => ({
        label: size.value,
        value: size.id,
    }));

    const colorsFormatted = (colors ?? []).map((color) => ({
        label: color.value,
        value: color.id,
    }));

    const [value, setValue] = useState(1);

    const handleGenerateSku = () => {
        const sku = generateSKU(name);
        form.setFieldValue("sku", sku);
    };

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <BreadcrumbHeader id={productId} storeId={storeId} name={initialData?.name || "New"} topic="products" />
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
                <div className="grid md:grid-cols-3 grid-cols-1 md:gap-8 gap-4">
                    <FieldGroup className="col-span-3">
                        <div className="w-full">
                            <form.Field
                                name="images"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <>
                                            <FieldLabel htmlFor={field.name}>Product Image</FieldLabel>

                                            <div className="flex item-center justify-start gap-4 mt-2">
                                                <ImageUploadProduct
                                                    previews={previews}
                                                    setPreviews={setPreviews}
                                                    onUpload={handleFilesUpload}
                                                    isUploading={upload.isPending}
                                                />
                                            </div>

                                            <Field data-invalid={isInvalid}>
                                                <Input
                                                    disabled
                                                    className="hidden"
                                                    type="text"
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        </>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="w-full flex items-center justify-between gap-x-6">
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
                                                    placeholder="Product name"
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => {
                                                        field.handleChange(e.target.value);
                                                        handleGenerateSku();
                                                    }}
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
                                    name="price"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                                                <InputGroup className="bg-background">
                                                    <InputGroupAddon>
                                                        <Label htmlFor="price">$</Label>
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        type="number"
                                                        min={0.01}
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                                        aria-invalid={isInvalid}
                                                        autoComplete="off"
                                                    />
                                                </InputGroup>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex-1 max-w-60">
                                <Label htmlFor="quantity">Quantity</Label>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        onClick={() => setValue(Math.max(1, value - 1))}
                                        size="icon"
                                        type="button"
                                        variant="outline"
                                        disabled={value === 1}
                                    >
                                        <MinusIcon className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        className="bg-background text-center max-w-40 [appearance:textfield]"
                                        id="quantity"
                                        min="1"
                                        onChange={(e) => setValue(Number(e.target.value))}
                                        type="number"
                                        value={value}
                                    />
                                    <Button onClick={() => setValue(value + 1)} size="icon" type="button" variant="outline">
                                        <PlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="w-full flex md:flex-row flex-col items-start md:items-center justify-between gap-6">
                            <div className="flex-1 max-w-60">
                                <form.Field
                                    name="categoryId"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                                                <div className="flex items-center justify-start gap-2">
                                                    <Select
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onValueChange={(val) => {
                                                            field.handleChange(val);
                                                            form.setFieldValue("colorId", "");
                                                            form.setFieldValue("sizeId", "");
                                                        }}
                                                    >
                                                        <SelectTrigger id="select-category" aria-invalid={isInvalid} className="min-w-60">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            {categoriesFormatted.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {categoriesFormatted.length === 0 && (
                                                        <Hint text="New category">
                                                            <Button
                                                                size="icon-sm"
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => router.push(`/admin/${storeId}/categories/new`)}
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
                            <div className="flex-1 max-w-60">
                                <form.Field
                                    name="sizeId"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Size</FieldLabel>
                                                <div className="flex items-center justify-start gap-2">
                                                    <Select
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onValueChange={field.handleChange}
                                                        disabled={categoryId === ""}
                                                    >
                                                        <SelectTrigger id="select-size" aria-invalid={isInvalid} className="min-w-60">
                                                            <SelectValue placeholder="Select size" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            {sizesFormatted.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    {item.label}
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
                            <div className="flex-1 max-w-60">
                                <form.Field
                                    name="colorId"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Color</FieldLabel>
                                                <div className="flex items-center justify-start gap-2">
                                                    <Select
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onValueChange={field.handleChange}
                                                        disabled={categoryId === ""}
                                                    >
                                                        <SelectTrigger id="select-color" aria-invalid={isInvalid} className="min-w-60">
                                                            <SelectValue placeholder="Select color" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            {colorsFormatted.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    <div className="flex items-center gap-x-2">
                                                                        <div
                                                                            className="h-4 w-4 rounded-full border"
                                                                            style={{
                                                                                backgroundColor: item.label,
                                                                            }}
                                                                        />
                                                                        {item.label}
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
                        {name && (
                            <div className="w-full max-w-300">
                                <form.Field
                                    name="sku"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>SKU</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        type="text"
                                                        placeholder="SP-ABCDEF"
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
                                                            title="Revalidate SKU"
                                                            aria-label="Revalidate Sku"
                                                            onClick={handleGenerateSku}
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
                        )}
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="w-full max-w-[60%]">
                            <form.Field
                                name="description"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Description
                                                <span className="text-neutral-600">(optional)</span>
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value || ""}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Detailed product information description..."
                                                className="min-h-30"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="w-full flex items-center justify-between gap-x-6">
                            <div className="flex-1 max-w-[50%]">
                                <form.Field
                                    name="isFeatured"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <FieldLabel>
                                                <Field orientation="horizontal" data-invalid={isInvalid}>
                                                    <Checkbox
                                                        id={field.name}
                                                        name={field.name}
                                                        aria-invalid={isInvalid}
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) => field.handleChange(checked === true)}
                                                    />
                                                    <FieldContent>
                                                        <FieldTitle>Featured</FieldTitle>
                                                        <FieldDescription>This product will appear on the home page.</FieldDescription>
                                                    </FieldContent>
                                                </Field>

                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </FieldLabel>
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex-1 max-w-60">
                                <form.Field
                                    name="status"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                                                <div className="flex items-center justify-start gap-2">
                                                    <Select
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onValueChange={(val) => field.handleChange(val as ProductStatus)}
                                                    >
                                                        <SelectTrigger id="select-status" aria-invalid={isInvalid}>
                                                            <SelectValue defaultValue={ProductStatus.DRAFT} />
                                                        </SelectTrigger>
                                                        <SelectContent position="item-aligned">
                                                            {statusOptions.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    <div className="flex items-center gap-x-2">
                                                                        <div className={`h-2 w-2 rounded-full ${item.color}`} />
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
                            <div className="flex-1 max-w-40">
                                <form.Field
                                    name="inStock"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field orientation="horizontal" data-invalid={isInvalid}>
                                                <Switch
                                                    id={field.name}
                                                    name={field.name}
                                                    checked={field.state.value}
                                                    onCheckedChange={field.handleChange}
                                                    aria-invalid={isInvalid}
                                                />
                                                <FieldLabel htmlFor={field.name}>In Stock</FieldLabel>
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </FieldGroup>
                </div>
                <form.Subscribe
                    selector={(state) => [state.isDirty, state.errors]}
                    children={([isDirty, errors]) => {
                        const isDisabled = initialData ? !isDirty || edit.isPending : create.isPending;

                        console.log(errors);

                        return (
                            <Button disabled={isDisabled || remove.isPending || upload.isPending} type="submit" className="ml-auto w-full md:w-auto">
                                {actionLabel}
                            </Button>
                        );
                    }}
                />
            </form>
        </>
    );
};
