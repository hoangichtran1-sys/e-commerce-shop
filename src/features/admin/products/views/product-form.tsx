/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { TrashIcon, PlusCircleIcon, XCircleIcon, BoxIcon, XIcon, PencilIcon, RefreshCwIcon, PaletteIcon, RulerIcon, ShirtIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createProductWithVariantsSchema } from "../schemas";
import { ImageUploadProduct } from "@/components/image-upload-product";
import { Checkbox } from "@/components/ui/checkbox";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { AttributeType, ProductStatus } from "@/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultipleSelect } from "@/components/multiple-select";
import { NoResults } from "@/components/no-results";
import { VariantsTable } from "../components/variants-table";
import { generateVariants } from "@/lib/generate-variants";
import { DEFAULT_VARIANT } from "@/constants";
import { cn } from "@/lib/utils";
import { SortableListInput, SortableListItem } from "@/components/sortable-list-input";
import { Cascader } from "@/components/cascader";
import { Preview } from "@/components/preview";
import { Editor } from "@/components/editor";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

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

const attributeTypeOption = [
    {
        label: "Color",
        value: AttributeType.COLOR.toLowerCase(),
        icon: PaletteIcon,
    },
    {
        label: "Size",
        value: AttributeType.SIZE.toLowerCase(),
        icon: RulerIcon,
    },
    {
        label: "Material",
        value: AttributeType.MATERIAL.toLowerCase(),
        icon: ShirtIcon,
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

    const { data: categories } = useSuspenseQuery(orpc.categories.getManyParent.queryOptions({ input: { storeId } }));

    const { data: attributes } = useSuspenseQuery(orpc.attributes.getMany.queryOptions({ input: { storeId } }));

    const derivedAttributes = useMemo(() => {
        if (!initialData) return { attributeSelect: [], selectedValues: {} };

        const uniqueAttribute = new Set<string>();

        const values: Record<string, string[]> = {};

        initialData.variants.forEach((variant) => {
            const combination = variant.combination as Record<string, string>;

            Object.entries(combination).forEach(([key, value]) => {
                const k = key.toLowerCase();

                uniqueAttribute.add(k);

                values[k] ??= [];

                if (!values[k].includes(value)) {
                    values[k].push(value);
                }
            });
        });

        return {
            attributeSelect: [...uniqueAttribute],
            selectedValues: values,
        };
    }, [initialData]);

    const [attributeSelect, setAttributeSelect] = useState<string[]>(() => {
        const uniqueAttribute = new Set<string>();
        if (initialData) {
            initialData.variants.forEach((variant) => {
                const combination = variant.combination as Record<string, string>;
                Object.entries(combination).forEach(([key, _]) => {
                    uniqueAttribute.add(key);
                });
            });
        }
        return [...uniqueAttribute];
    });
    const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>(() => {
        const values: Record<string, string[]> = {};
        if (initialData) {
            initialData.variants.forEach((variant) => {
                const combination = variant.combination as Record<string, string>;
                Object.entries(combination).forEach(([key, value]) => {
                    values[key] ??= [];
                    if (!values[key].includes(value)) {
                        values[key].push(value);
                    }
                });
            });
        }
        return values;
    });

    const categoriesFormatted = categories.map((category) => ({
        label: category.name,
        value: category.id,
        children: category.children.map((child) => ({ label: child.name, value: child.id })),
        disabled: category.children.length === 0,
    }));

    const initialVariants = (initialData?.variants ?? [DEFAULT_VARIANT]).map((variant) => ({
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        combination: variant.combination as Record<string, string>,
    }));

    const [listItem, setListItem] = useState<SortableListItem[]>(() => {
        if (initialData) {
            return initialData.features.map((feature) => ({
                name: feature,
                isDeletable: true,
            }));
        }
        return [];
    });

    const [previews, setPreviews] = useState<string[]>(() => {
        const initialImagePreview = (initialData?.images || []).map((image) => image.url);

        return initialImagePreview;
    });

    const [isEditing, setIdEditing] = useState(false);

    const [categoriesValue, setCategoriesValue] = useState<string[]>(() => {
        const categories: string[] = [];
        if (initialData) {
            categories.push(initialData.categoryId);
            if (initialData.category.parentId) {
                categories.unshift(initialData.category.parentId);
            }
        }
        return categories;
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
            name: initialData?.name || "",
            status: initialData?.status || ProductStatus.DRAFT,
            isFeatured: !!initialData?.isFeatured,
            images: previews || [],
            description: initialData?.description || null,
            variants: initialVariants,
            features: initialData?.features || [],
        },
        validators: {
            onSubmit: createProductWithVariantsSchema.omit({ storeId: true }),
        },
        onSubmit: ({ value }) => {
            console.log(value);
            if (initialData) {
                edit.mutate({
                    id: productId,
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

    const toggleEdit = () => setIdEditing((current) => !current);

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this product");

    const actionLabel = initialData ? "Save changes" : "Create";

    const name = useStore(form.store, (state) => state.values.name);
    const currentVariants = useStore(form.store, (state) => state.values.variants);

    useEffect(() => {
        const listVariantsGenerated = generateVariants(selectedValues);

        if (listVariantsGenerated.length === 0) return;

        const currentVariantsInForm = form.getFieldValue("variants") || [];

        if (currentVariantsInForm.length === listVariantsGenerated.length) {
            const isSameStructure = listVariantsGenerated.every((gen, index) => {
                const current = currentVariantsInForm[index];
                return current && JSON.stringify(gen.combination) === JSON.stringify(current.combination);
            });

            if (isSameStructure) {
                return;
            }
        }

        const mergedVariants = listVariantsGenerated.map((gen) => {
            const existingVariant = currentVariantsInForm.find((curr) => JSON.stringify(curr.combination) === JSON.stringify(gen.combination));
            return existingVariant || gen;
        });

        form.setFieldValue("variants", mergedVariants);
    }, [selectedValues]);

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
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 lg:col-span-8">
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-y-4">
                                <FieldGroup>
                                    <div className="max-w-[60%]">
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
                                </FieldGroup>
                                <FieldGroup>
                                    <div className="max-w-[60%]">
                                        <form.Field
                                            name="features"
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <FieldLabel htmlFor={field.name}>Features</FieldLabel>
                                                        <SortableListInput
                                                            value={listItem}
                                                            onChange={(values) => {
                                                                setListItem(values);
                                                                form.setFieldValue(
                                                                    "features",
                                                                    values.map((item) => item.name),
                                                                );
                                                            }}
                                                        />
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>
                                </FieldGroup>
                                <FieldGroup>
                                    <div className="w-full">
                                        <form.Field
                                            name="description"
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <FieldLabel htmlFor={field.name}>
                                                            <div className="flex items-center gap-x-2">
                                                                <span>Description (option)</span>
                                                                <Button
                                                                    type="button"
                                                                    title="Edit description product"
                                                                    size="icon-xs"
                                                                    className="shadow-sm border rounded-full"
                                                                    onClick={toggleEdit}
                                                                    variant="outline"
                                                                >
                                                                    {isEditing ? (
                                                                        <>
                                                                            <XIcon className="size-3" />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <PencilIcon className="size-3" />
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </FieldLabel>
                                                        {!isEditing && (
                                                            <div className={cn("text-sm mt-2", !initialData?.description && "text-slate-500 italic")}>
                                                                {!initialData?.description && "No description"}
                                                                {initialData?.description && <Preview value={initialData.description} />}
                                                            </div>
                                                        )}
                                                        {isEditing && (
                                                            <Editor
                                                                value={field.state.value || ""}
                                                                onChange={(value) => field.handleChange(value)}
                                                                aria-invalid={isInvalid}
                                                            />
                                                        )}
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-x-3">
                                        <h3>Select attribute</h3>
                                        <Button
                                            variant="outline"
                                            title="Refresh old attribute"
                                            onClick={() => {
                                                setAttributeSelect(derivedAttributes.attributeSelect);
                                                setSelectedValues(derivedAttributes.selectedValues);
                                            }}
                                            type="button"
                                            size="icon"
                                        >
                                            <RefreshCwIcon />
                                        </Button>
                                    </div>
                                    {/* <Popover>
                                        <PopoverTrigger asChild>
                                            <Button className="text-center" variant="outline">
                                                <PlusCircleIcon />
                                                Add attribute
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto" side="right">
                                            <div className="flex flex-col items-center rounded-sm gap-y-2">
                                                {attributeTypeOption.map((item) => (
                                                    <div key={item.value}>
                                                        <div className="flex items-center justify-between gap-x-2 px-2">
                                                            <Button
                                                                className="w-auto"
                                                                onClick={() => {
                                                                    setAttributeSelect((current) => [...current, item.value]);
                                                                }}
                                                                key={item.value}
                                                                variant="ghost"
                                                                disabled={attributeSelect.includes(item.value)}
                                                            >
                                                                {item.label}
                                                            </Button>
                                                            {attributeSelect.includes(item.value) && (
                                                                <CheckIcon className="text-muted-foreground size-3" />
                                                            )}
                                                        </div>
                                                        <Separator />
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover> */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="text-center" variant="outline">
                                                <PlusCircleIcon />
                                                Add attribute
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="min-w-40" side="right">
                                            <DropdownMenuGroup>
                                                <DropdownMenuLabel>Attributes</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {attributeTypeOption.map((item) => (
                                                    <DropdownMenuCheckboxItem
                                                        checked={attributeSelect.includes(item.value)}
                                                        key={item.value}
                                                        onCheckedChange={() => {
                                                            if (attributeSelect.includes(item.value)) {
                                                                setAttributeSelect((current) => current.filter((attr) => attr !== item.value));
                                                            } else {
                                                                setAttributeSelect((current) => [...current, item.value]);
                                                            }
                                                        }}
                                                    >
                                                        <item.icon className="size-3" />
                                                        {item.label}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-y-4">
                                {attributeSelect.length === 0 && <NoResults icon={BoxIcon} topic="attributes" />}
                                {attributeSelect.map((attribute, index) => {
                                    const uniqueValues = new Set<string>();

                                    attributes
                                        .filter((attr) => attr.type.toLowerCase() === attribute)
                                        .forEach((attr) => {
                                            attr.values.forEach((val) => {
                                                uniqueValues.add(val.value);
                                            });
                                        });

                                    const attributeValuesFormatted = [...uniqueValues].map((val) => ({
                                        label: val,
                                        value: val,
                                    }));

                                    return (
                                        <div key={index} className="max-w-[60%] w-full flex gap-x-2">
                                            <MultipleSelect
                                                options={attributeValuesFormatted}
                                                topic={attribute}
                                                selectedValues={selectedValues[attribute] ?? []}
                                                setSelectedValues={(val) => {
                                                    setSelectedValues((current) => ({
                                                        ...current,
                                                        [attribute]: val,
                                                    }));
                                                }}
                                            />
                                            <Button
                                                onClick={() => {
                                                    setSelectedValues((current) => ({
                                                        ...current,
                                                        [attribute]: [],
                                                    }));
                                                    setAttributeSelect((current) => current.filter((attr) => attr !== attribute));
                                                }}
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <XCircleIcon className="size-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Product Variants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <div className="max-w-full">
                                        <form.Field
                                            name="variants"
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <VariantsTable
                                                            variants={currentVariants}
                                                            productName={name || "PRD"}
                                                            backupVariants={initialVariants}
                                                            onChange={(updatedVariants) => {
                                                                form.setFieldValue("variants", updatedVariants);
                                                            }}
                                                        />
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Select Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <div className="w-full">
                                        <form.Field
                                            name="categoryId"
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <Cascader
                                                            options={categoriesFormatted}
                                                            value={categoriesValue}
                                                            onChange={(val) => {
                                                                setCategoriesValue(val);
                                                                form.setFieldValue("categoryId", val[val.length - 1]);
                                                            }}
                                                            placeholder="Select category"
                                                        />
                                                        {/* <FieldDescription>{categoriesValue.join(" / ") || "None"}</FieldDescription> */}
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <h3 className="font-bold">Product Image</h3>
                                    <p className="font-light text-xs hover:cursor-pointer hover:underline">Add media from URL</p>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <div className="w-full">
                                        <form.Field
                                            name="images"
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                                return (
                                                    <>
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
                            </CardContent>
                        </Card>
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Other Options</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <div className="max-w-full flex flex-col items-start justify-start gap-y-4">
                                        <div className="flex-1 w-full">
                                            <form.Field
                                                name="status"
                                                children={(field) => {
                                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                    return (
                                                        <Field data-invalid={isInvalid}>
                                                            <div className="flex items-center justify-start gap-2">
                                                                <Select
                                                                    name={field.name}
                                                                    value={field.state.value}
                                                                    onValueChange={(val) => field.handleChange(val as ProductStatus)}
                                                                >
                                                                    <SelectTrigger className="min-w-60" id="select-status" aria-invalid={isInvalid}>
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
                                                            <FieldDescription>Set the product status.</FieldDescription>
                                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                        </Field>
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
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
                                    </div>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                    </div>
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
