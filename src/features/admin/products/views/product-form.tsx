/* eslint-disable react/no-children-prop */
"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import {
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { TrashIcon, PlusCircleIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Hint } from "@/components/hint";
import { createProductSchema } from "../schemas";
import { ImageUploadProduct } from "@/components/image-upload-product";
import { Checkbox } from "@/components/ui/checkbox";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

interface ProductFormProps {
    productId: string;
    storeId: string;
}

export const ProductForm = ({ storeId, productId }: ProductFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.products.getOne.queryOptions({
            input: { id: productId, storeId },
        }),
    );

    const { data: categories } = useSuspenseQuery(
        orpc.categories.getMany.queryOptions({ input: { storeId } }),
    );

    const categoriesFormatted = categories.map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const [previews, setPreviews] = useState<string[]>(() => {
        const initialImagePreview = (initialData?.images || []).map(
            (image) => image.url,
        );

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
            price: initialData?.price ? initialData.price : 0.01,
            isFeatured: !!initialData?.isFeatured,
            isArchived: !!initialData?.isArchived,
            images: previews || [],
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
            if (!isUploadingRef.current && !upload.isPending) {
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

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will permanently remove this product",
    );

    const title = initialData ? "Edit product" : "Create product";
    const description = initialData ? "Edit a product" : "Add a new product";
    const actionLabel = initialData ? "Save changes" : "Create";

    const categoryId = useStore(form.store, (state) => state.values.categoryId);

    const prevCategoryId = useRef(categoryId);

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

    useEffect(() => {
        if (prevCategoryId.current === categoryId) return;

        prevCategoryId.current = categoryId;    

        form.setFieldValue("sizeId", "");
        form.setFieldValue("colorId", "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    const [value, setValue] = useState(1);

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <Heading title={title} description={description} />
                {initialData && (
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={edit.isPending || remove.isPending}
                        onClick={handleRemove}
                    >
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
                    <FieldGroup className="min-w-50 md:col-span-3">
                        <form.Field
                            name="images"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;

                                return (
                                    <>
                                        <FieldLabel htmlFor={field.name}>
                                            Product Image
                                        </FieldLabel>

                                        <div className="flex item-center justify-start gap-4">
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
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    </>
                                );
                            }}
                        />
                    </FieldGroup>
                    <FieldGroup className="min-w-50">
                        <form.Field
                            name="name"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Name
                                        </FieldLabel>
                                        <Input
                                            className="max-w-60"
                                            type="text"
                                            placeholder="Product name"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            aria-invalid={isInvalid}
                                            autoComplete="off"
                                        />
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                        <form.Field
                            name="categoryId"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Category
                                        </FieldLabel>
                                        <div className="flex items-center justify-start gap-2">
                                            <Select
                                                name={field.name}
                                                value={field.state.value}
                                                onValueChange={
                                                    field.handleChange
                                                }
                                            >
                                                <SelectTrigger
                                                    id="select-category"
                                                    aria-invalid={isInvalid}
                                                    className="min-w-60"
                                                >
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    {categoriesFormatted.map(
                                                        (item) => (
                                                            <SelectItem
                                                                key={item.value}
                                                                value={
                                                                    item.value
                                                                }
                                                            >
                                                                {item.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {categoriesFormatted.length ===
                                                0 && (
                                                <Hint text="New category">
                                                    <Button
                                                        size="icon-sm"
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/${storeId}/categories/new`,
                                                            )
                                                        }
                                                    >
                                                        <PlusCircleIcon className="size-4" />
                                                    </Button>
                                                </Hint>
                                            )}
                                        </div>
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>
                    <FieldGroup className="min-w-50 max-w-60">
                        <form.Field
                            name="price"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Price
                                        </FieldLabel>
                                        <InputGroup className="bg-background">
                                            <InputGroupAddon>
                                                <Label htmlFor="price">$</Label>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                className="max-w-60"
                                                type="number"
                                                min={0.01}
                                                step="0.01"
                                                placeholder="0.00"
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                                autoComplete="off"
                                            />
                                        </InputGroup>
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                        <form.Field
                            name="sizeId"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Size
                                        </FieldLabel>
                                        <div className="flex items-center justify-start gap-2">
                                            <Select
                                                name={field.name}
                                                value={field.state.value}
                                                onValueChange={
                                                    field.handleChange
                                                }
                                                disabled={categoryId === ""}
                                            >
                                                <SelectTrigger
                                                    id="select-size"
                                                    aria-invalid={isInvalid}
                                                    className="min-w-60"
                                                >
                                                    <SelectValue placeholder="Select size" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    {sizesFormatted.map(
                                                        (item) => (
                                                            <SelectItem
                                                                key={item.value}
                                                                value={
                                                                    item.value
                                                                }
                                                            >
                                                                {item.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>
                    <FieldGroup className="min-w-50">
                        <div className="w-full max-w-sm space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() =>
                                        setValue(Math.max(1, value - 1))
                                    }
                                    size="icon"
                                    type="button"
                                    variant="outline"
                                >
                                    <MinusIcon className="h-4 w-4" />
                                </Button>
                                <Input
                                    className="bg-background text-center max-w-40"
                                    id="quantity"
                                    min="1"
                                    onChange={(e) =>
                                        setValue(Number(e.target.value))
                                    }
                                    type="number"
                                    value={value}
                                />
                                <Button
                                    onClick={() => setValue(value + 1)}
                                    size="icon"
                                    type="button"
                                    variant="outline"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <form.Field
                            name="colorId"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Color
                                        </FieldLabel>
                                        <div className="flex items-center justify-start gap-2">
                                            <Select
                                                name={field.name}
                                                value={field.state.value}
                                                onValueChange={
                                                    field.handleChange
                                                }
                                                disabled={categoryId === ""}
                                            >
                                                <SelectTrigger
                                                    id="select-color"
                                                    aria-invalid={isInvalid}
                                                    className="min-w-60"
                                                >
                                                    <SelectValue placeholder="Select color" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    {colorsFormatted.map(
                                                        (item) => (
                                                            <SelectItem
                                                                key={item.value}
                                                                value={
                                                                    item.value
                                                                }
                                                            >
                                                                <div className="flex items-center gap-x-2">
                                                                    <div
                                                                        className="h-4 w-4 rounded-full border"
                                                                        style={{
                                                                            backgroundColor:
                                                                                item.label,
                                                                        }}
                                                                    />
                                                                    {item.label}
                                                                </div>
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>
                    <FieldGroup className="min-w-50">
                        <form.Field
                            name="isFeatured"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <FieldLabel>
                                        <Field
                                            orientation="horizontal"
                                            data-invalid={isInvalid}
                                        >
                                            <Checkbox
                                                id={field.name}
                                                name={field.name}
                                                aria-invalid={isInvalid}
                                                checked={field.state.value}
                                                onCheckedChange={(checked) =>
                                                    field.handleChange(
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <FieldContent>
                                                <FieldTitle>
                                                    Featured
                                                </FieldTitle>
                                                <FieldDescription>
                                                    This product will appear on
                                                    the home page.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>

                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </FieldLabel>
                                );
                            }}
                        />
                    </FieldGroup>
                    <FieldGroup className="min-w-50">
                        <form.Field
                            name="isArchived"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <FieldLabel>
                                        <Field
                                            orientation="horizontal"
                                            data-invalid={isInvalid}
                                        >
                                            <Checkbox
                                                id={field.name}
                                                name={field.name}
                                                aria-invalid={isInvalid}
                                                checked={field.state.value}
                                                onCheckedChange={(checked) =>
                                                    field.handleChange(
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <FieldContent>
                                                <FieldTitle>
                                                    Archived
                                                </FieldTitle>
                                                <FieldDescription>
                                                    This product will not appear
                                                    anywhere in the store.
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>

                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </FieldLabel>
                                );
                            }}
                        />
                    </FieldGroup>
                </div>
                <form.Subscribe
                    selector={(state) => [state.isDirty, state.errors]}
                    children={([isDirty, errors]) => {
                        const isDisabled = initialData
                            ? !isDirty || edit.isPending
                            : create.isPending;

                        console.log(errors);

                        return (
                            <Button
                                disabled={
                                    isDisabled ||
                                    remove.isPending ||
                                    upload.isPending
                                }
                                type="submit"
                                className="ml-auto w-full md:w-auto"
                            >
                                {actionLabel}
                            </Button>
                        );
                    }}
                />
            </form>
        </>
    );
};
