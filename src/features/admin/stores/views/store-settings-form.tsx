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
import { TrashIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiAlert } from "@/components/api-alert";
import { useOrigin } from "@/hooks/use-origin";

interface StoreSettingsFormProps {
    storeId: string;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export const StoreSettingsForm = ({ storeId }: StoreSettingsFormProps) => {
    const router = useRouter();
    const origin = useOrigin();
    const queryClient = useQueryClient();

    const { data: initialData } = useSuspenseQuery(
        orpc.stores.getOne.queryOptions({ input: { id: storeId } }),
    );

    const edit = useMutation(
        orpc.stores.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Store updated");
                queryClient.invalidateQueries(
                    orpc.stores.getMany.queryOptions(),
                );
                queryClient.invalidateQueries(
                    orpc.stores.getOne.queryOptions({ input: { id: data.id } }),
                );
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const remove = useMutation(
        orpc.stores.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Store deleted");
                queryClient.invalidateQueries(
                    orpc.stores.getMany.queryOptions(),
                );
                router.push("/admin");
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: initialData.name,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            edit.mutate({ id: storeId, name: value.name });
        },
    });

    const handleRemove = async () => {
        const ok = await confirmRemove();
        if (!ok) return;

        await remove.mutateAsync({ id: storeId });
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will permanently remove this store",
    );

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <Heading
                    title="Settings"
                    description="Manage store preferences"
                />
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={edit.isPending || remove.isPending}
                    onClick={handleRemove}
                >
                    <TrashIcon className="size-4" />
                </Button>
            </div>
            <Separator />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
                className="space-y-8 w-full"
            >
                <div className="grid grid-cols-3 gap-8">
                    <FieldGroup>
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
                                            placeholder="Store name"
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
                    </FieldGroup>
                </div>
                <form.Subscribe
                    selector={(state) => [state.values]}
                    children={([values]) => {
                        const hasChanged = values.name !== initialData.name;

                        return (
                            <Button
                                disabled={
                                    !hasChanged ||
                                    edit.isPending ||
                                    remove.isPending
                                }
                                type="submit"
                                className="ml-auto"
                            >
                                Save changes
                            </Button>
                        );
                    }}
                />
            </form>
            <Separator />
            <ApiAlert
                title="NEXT_PUBLIC_API_URL"
                description={`${origin}/api/${storeId}`}
                variant="public"
            />
        </>
    );
};
