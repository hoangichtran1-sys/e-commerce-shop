/* eslint-disable react/no-children-prop */
"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { PlusCircleIcon, TrashIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Hint } from "@/components/hint";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SizeFormProps {
    sizeId: string;
    storeId: string;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    value: z
        .string()
        .min(1)
        .max(10)
        .regex(/^[a-zA-Z0-9\s]+$/)
        .transform((val) => val.toUpperCase()),
    categoryId: z.string().min(1),
});

export const SizeForm = ({ storeId, sizeId }: SizeFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.sizes.getOneByID.queryOptions({
            input: { id: sizeId, storeId },
        }),
    );

    const { data: categories } = useSuspenseQuery(
        orpc.categories.getMany.queryOptions({ input: { storeId } }),
    );

    const categoriesFormatted = categories.map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const create = useMutation(
        orpc.sizes.create.mutationOptions({
            onSuccess: () => {
                toast.success("Size created");
                queryClient.invalidateQueries(
                    orpc.sizes.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/sizes`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.sizes.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Size updated");
                queryClient.invalidateQueries(
                    orpc.sizes.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.sizes.getOneByID.queryOptions({
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
        orpc.sizes.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Size deleted");
                queryClient.invalidateQueries(
                    orpc.categories.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/sizes`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: initialData?.name || "",
            value: initialData?.value || "",
            categoryId: initialData?.categoryId || "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: sizeId,
                    storeId,
                    name: value.name,
                    value: value.value,
                    categoryId: value.categoryId,
                });
            } else {
                create.mutate({
                    storeId,
                    name: value.name,
                    value: value.value,
                    categoryId: value.categoryId,
                });
            }
        },
    });

    const handleRemove = async () => {
        const ok = await confirmRemove();
        if (!ok) return;

        await remove.mutateAsync({ id: sizeId, storeId });
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will permanently remove this size",
    );

    const title = initialData ? "Edit size" : "Create size";
    const description = initialData ? "Edit a size" : "Add a new size";
    const actionLabel = initialData ? "Save changes" : "Create";

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
                <div className="grid md:grid-cols-3 grid-cols-1 gap-8">
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
                                        placeholder="Size name"
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
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
                        name="value"
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
                                        placeholder="e.g: M, L, XL or 39, 40, 41..."
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
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
                                            onValueChange={field.handleChange}
                                        >
                                            <SelectTrigger
                                                id="select-billboard"
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
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {categoriesFormatted.length === 0 && (
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
                </div>
                <form.Subscribe
                    selector={(state) => [state.values]}
                    children={([values]) => {
                        const isDirty =
                            values.name !== (initialData?.name || "") ||
                            values.value !== (initialData?.value || "") ||
                            values.categoryId !==
                                (initialData?.categoryId || "");

                        const isDisabled = initialData
                            ? !isDirty || edit.isPending
                            : create.isPending;

                        return (
                            <Button
                                disabled={isDisabled || remove.isPending}
                                type="submit"
                                className="ml-auto"
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
