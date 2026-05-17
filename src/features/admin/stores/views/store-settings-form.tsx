/* eslint-disable react/no-children-prop */
"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { RedoIcon, TrashIcon, UndoIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import slug from "slug";
import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Hint } from "@/components/hint";
import { ImageUploadBillboard } from "@/components/image-upload-billboard";

interface StoreSettingsFormProps {
    storeId: string;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().nullable(),
    thumbnailUrl: z.string().min(1).nullable(),
});

export const StoreSettingsForm = ({ storeId }: StoreSettingsFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [files, setFiles] = useState<File[]>([]);

    const { data: initialData } = useSuspenseQuery(orpc.stores.getOne.queryOptions({ input: { id: storeId } }));

    const edit = useMutation(
        orpc.stores.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Store updated");
                queryClient.invalidateQueries(orpc.stores.getMany.queryOptions());
                queryClient.invalidateQueries(orpc.stores.getOne.queryOptions({ input: { id: data.id } }));
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
                queryClient.invalidateQueries(orpc.stores.getMany.queryOptions());
                router.push("/admin");
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const upload = useMutation(
        orpc.stores.upload.mutationOptions({
            onSuccess: (data) => {
                toast.success("Thumbnail uploaded");
                form.setFieldValue("thumbnailUrl", data.url);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            name: initialData.name,
            description: initialData.description,
            thumbnailUrl: initialData.thumbnail,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            edit.mutate({
                id: storeId,
                name: value.name,
                description: value.description,
                thumbnailUrl: value.thumbnailUrl,
            });
        },
    });

    const handleRemove = async () => {
        const ok = await confirmRemove();
        if (!ok) return;

        await remove.mutateAsync({ id: storeId });
    };

    const handleRemoveImage = () => {
        form.setFieldValue("thumbnailUrl", null);
        setFiles([]);
    };

    const [RemoveConfirmation, confirmRemove] = useConfirm("Are you sure?", "The following action will permanently remove this store");

    const name = useStore(form.store, (state) => state.values.name);

    const isUploadingRef = useRef(false);

    const handleFilesChange = useCallback(
        (newFiles: File[]) => {
            setFiles(newFiles);

            const isNewFile = newFiles.length > 0 && newFiles[0] !== files[0];

            if (isNewFile && !isUploadingRef.current && !upload.isPending) {
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
        [files, upload],
    );

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <Heading title="Settings" description="Manage store preferences" />
                <Button variant="destructive" size="sm" disabled={edit.isPending || remove.isPending} onClick={handleRemove}>
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
                    <FieldGroup className="col-span-3">
                        <div className="w-full max-w-60">
                            <form.Field
                                name="name"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                            <Input
                                                type="text"
                                                placeholder="Store name"
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                autoComplete="off"
                                            />
                                            <FieldDescription>Store slug: {slug(name)}</FieldDescription>
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="w-full max-w-100">
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
                                                placeholder="Provide more information about the store..."
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
                        <div className="w-full max-w-[80%]">
                            <form.Field
                                name="thumbnailUrl"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <>
                                            <FieldLabel htmlFor={field.name}>Thumbnail</FieldLabel>
                                            {field.state.value ? (
                                                <div className="flex item-center justify-start gap-4 aspect-3/1 mt-2">
                                                    <Image
                                                        width={600}
                                                        height={300}
                                                        src={field.state.value}
                                                        alt="Image"
                                                        className="md:h-[80%] md:w-[80%] h-full w-full object-cover"
                                                    />
                                                    <Hint text="Redo">
                                                        <Button size="icon-xs" variant="destructive" onClick={handleRemoveImage} type="button">
                                                            <RedoIcon />
                                                        </Button>
                                                    </Hint>
                                                </div>
                                            ) : (
                                                <div className="flex item-center justify-start gap-4 mt-2">
                                                    <ImageUploadBillboard
                                                        files={files}
                                                        onFilesChange={handleFilesChange}
                                                        isUploading={upload.isPending}
                                                    />
                                                    {initialData && (
                                                        <Hint text="Undo">
                                                            <Button
                                                                size="icon-xs"
                                                                variant="secondary"
                                                                onClick={() => {
                                                                    form.setFieldValue("thumbnailUrl", initialData.thumbnail);
                                                                }}
                                                                type="button"
                                                            >
                                                                <UndoIcon />
                                                            </Button>
                                                        </Hint>
                                                    )}
                                                </div>
                                            )}
                                            <Field data-invalid={isInvalid}>
                                                <Input
                                                    disabled
                                                    className="hidden"
                                                    type="text"
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value || ""}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        </>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                </div>
                <form.Subscribe
                    selector={(state) => [state.values]}
                    children={([values]) => {
                        const hasChanged = values.name !== initialData.name || values.description !== initialData.description || values.thumbnailUrl !== initialData.thumbnail;

                        return (
                            <Button disabled={!hasChanged || edit.isPending || remove.isPending} type="submit" className="ml-auto">
                                Save changes
                            </Button>
                        );
                    }}
                />
            </form>
       </>
    );
};
