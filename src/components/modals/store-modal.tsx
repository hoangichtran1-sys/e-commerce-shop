/* eslint-disable react/no-children-prop */
"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { ResponsiveModal } from "../responsive-modal";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export const StoreModal = () => {
    const { isOpen, onClose } = useStoreModal();

    const create = useMutation(
        orpc.stores.create.mutationOptions({
            onSuccess: (data) => {
                toast.success("Store created");
                window.location.assign(`/admin/${data.id}`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            create.mutate({ name: value.name });
        },
    });

    return (
        <ResponsiveModal
            title="Create store"
            description="Add a new store to manage products and categories"
            isOpen={isOpen}
            onClose={onClose}
        >
            <div>
                <div className="space-y-4 py-2 pb-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
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
                                                placeholder="E-Commerce Store"
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
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        </FieldGroup>
                        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                            <Button
                                disabled={create.isPending}
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button disabled={create.isPending} type="submit">
                                Continue
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ResponsiveModal>
    );
};
