/* eslint-disable react/no-children-prop */
"use client";

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
import { BreadcrumbHeader } from "@/components/breadcrumb-header";

interface CategoryFormProps {
    categoryId: string;
    storeId: string;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    billboardId: z.string().min(1),
});

export const CategoryForm = ({ storeId, categoryId }: CategoryFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.categories.getOne.queryOptions({
            input: { id: categoryId, storeId },
        }),
    );

    const { data: billboards } = useSuspenseQuery(
        orpc.billboards.getMany.queryOptions({ input: { storeId } }),
    );

    const billboardFormatted = billboards.map((billboard) => ({
        label: billboard.label,
        value: billboard.id,
    }));

    const create = useMutation(
        orpc.categories.create.mutationOptions({
            onSuccess: () => {
                toast.success("Category created");
                queryClient.invalidateQueries(
                    orpc.categories.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/categories`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.categories.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Category updated");
                queryClient.invalidateQueries(
                    orpc.categories.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.categories.getOne.queryOptions({
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
        orpc.categories.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Category deleted");
                queryClient.invalidateQueries(
                    orpc.categories.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/categories`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: initialData?.name || "",
            billboardId: initialData?.billboardId || "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: categoryId,
                    storeId,
                    name: value.name,
                    billboardId: value.billboardId,
                });
            } else {
                create.mutate({
                    storeId,
                    name: value.name,
                    billboardId: value.billboardId,
                });
            }
        },
    });

    const handleRemove = async () => {
        const ok = await confirmRemove();
        if (!ok) return;

        await remove.mutateAsync({ id: categoryId, storeId });
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will permanently remove this category",
    );

    const actionLabel = initialData ? "Save changes" : "Create";

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <BreadcrumbHeader
                    id={categoryId}
                    storeId={storeId}
                    name={initialData?.name || "New"}
                    topic="categories"
                />
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
                                        placeholder="Category name"
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
                        name="billboardId"
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Billboard
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
                                                <SelectValue placeholder="Select billboard" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {billboardFormatted.map(
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
                                        {billboardFormatted.length === 0 && (
                                            <Hint text="Add billboard">
                                                <Button
                                                    size="icon-sm"
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/${storeId}/billboards/new`,
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
                            values.billboardId !==
                                (initialData?.billboardId || "");

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
