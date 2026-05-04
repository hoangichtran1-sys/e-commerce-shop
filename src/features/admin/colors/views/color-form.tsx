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
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
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
import { InputColor } from "@/components/input-color";

interface ColorFormProps {
    colorId: string;
    storeId: string;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    value: z
        .string()
        .regex(
            /^[#][0-9A-Fa-f]{6}$/,
            "Color must be a valid hex color (e.g., #FFFFFF)",
        )
        .transform((val) => val.toUpperCase()),
    categoryId: z.string().min(1),
});

export const ColorForm = ({ storeId, colorId }: ColorFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.colors.getOneByID.queryOptions({
            input: { id: colorId, storeId },
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
        orpc.colors.create.mutationOptions({
            onSuccess: () => {
                toast.success("Color created");
                queryClient.invalidateQueries(
                    orpc.colors.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/colors`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.colors.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Color updated");
                queryClient.invalidateQueries(
                    orpc.colors.getManyByStore.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.colors.getOneByID.queryOptions({
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
        orpc.colors.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Color deleted");
                queryClient.invalidateQueries(
                    orpc.categories.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/colors`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: initialData?.name || "",
            value: initialData?.value || "#000000",
            categoryId: initialData?.categoryId || "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: colorId,
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

        await remove.mutateAsync({ id: colorId, storeId });
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will permanently remove this color",
    );

    const title = initialData ? "Edit color" : "Create color";
    const description = initialData ? "Edit a color" : "Add a new color";
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
                    <FieldGroup className="max-w-60">
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
                                            type="text"
                                            placeholder="Color name"
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
                            name="value"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Value
                                            <span className="text-neutral-600">
                                                (Select color)
                                            </span>
                                        </FieldLabel>
                                        <InputColor
                                            label=""
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            className="mt-0"
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
                    </FieldGroup>
                    <FieldGroup>
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
