/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { TrashIcon, RedoIcon, UndoIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// import { ApiAlert } from "@/components/api-alert";
// import { useOrigin } from "@/hooks/use-origin";
import { ImageUploadBillboard } from "@/components/image-upload-billboard";
import { useCallback, useRef, useState } from "react";
import { Hint } from "@/components/hint";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { Switch } from "@/components/ui/switch";

interface BillboardFormProps {
    billboardId: string;
    storeId: string;
}

const formSchema = z.object({
    label: z.string().min(1, "Label is required"),
    imageUrl: z.string().min(1),
    isActive: z.boolean(),
});

export const BillboardForm = ({ storeId, billboardId }: BillboardFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [files, setFiles] = useState<File[]>([]);

    const { data: initialData } = useSuspenseQuery(
        orpc.billboards.getOne.queryOptions({
            input: { id: billboardId, storeId },
        }),
    );

    const [showImage, setShowImage] = useState(!!initialData?.imageUrl);

    const create = useMutation(
        orpc.billboards.create.mutationOptions({
            onSuccess: () => {
                toast.success("Billboard created");
                queryClient.invalidateQueries(
                    orpc.billboards.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/billboards`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const edit = useMutation(
        orpc.billboards.update.mutationOptions({
            onSuccess: (data) => {
                toast.success("Billboard updated");
                queryClient.invalidateQueries(
                    orpc.billboards.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.billboards.getOne.queryOptions({
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
        orpc.billboards.delete.mutationOptions({
            onSuccess: () => {
                toast.success("Billboard deleted");
                queryClient.invalidateQueries(
                    orpc.billboards.getMany.queryOptions({
                        input: { storeId },
                    }),
                );
                router.push(`/admin/${storeId}/billboards`);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const upload = useMutation(
        orpc.billboards.upload.mutationOptions({
            onSuccess: (data) => {
                toast.success("Image uploaded");
                form.setFieldValue("imageUrl", data.url);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            label: initialData?.label || "",
            imageUrl: initialData?.imageUrl || "",
            isActive: !!initialData?.isActive,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            if (initialData) {
                edit.mutate({
                    id: billboardId,
                    storeId,
                    label: value.label,
                    newImageUrl: value.imageUrl,
                    isActive: value.isActive,
                });
            } else {
                create.mutate({
                    storeId,
                    label: value.label,
                    imageUrl: value.imageUrl,
                    isActive: value.isActive,
                });
            }
        },
    });

    const handleRemove = async () => {
        const ok = await confirmRemove();
        if (!ok) return;

        await remove.mutateAsync({ id: billboardId, storeId });
    };

    const handleRemoveImage = () => {
        setShowImage(false);
        form.setFieldValue("imageUrl", "");
        setFiles([]);
    };

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

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will permanently remove this billboard",
    );

    const actionLabel = initialData ? "Save changes" : "Create";

    return (
        <>
            <RemoveConfirmation />
            <div className="flex items-center justify-between">
                <BreadcrumbHeader
                    id={billboardId}
                    storeId={storeId}
                    name={initialData?.label || "New"}
                    topic="billboards"
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
                <div className="grid grid-cols-3 gap-8">
                    <FieldGroup className="col-span-3">
                        <div className="w-full max-w-60">
                            <form.Field
                                name="label"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Label</FieldLabel>
                                            <Input
                                                className="max-w-50"
                                                type="text"
                                                placeholder="Billboard label"
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                autoComplete="off"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="w-full max-w-[80%]">
                            <form.Field
                                name="imageUrl"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <>
                                            <FieldLabel htmlFor={field.name}>
                                                Background Image
                                            </FieldLabel>
                                            {showImage && field.state.value ? (
                                                <div className="flex item-center justify-start gap-4 aspect-3/1 mt-2">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={field.state.value}
                                                        alt="Image"
                                                        className="md:h-[80%] md:w-[80%] h-full w-full object-cover"
                                                    />
                                                    <Hint text="Redo">
                                                        <Button
                                                            size="icon-xs"
                                                            variant="destructive"
                                                            onClick={handleRemoveImage}
                                                            type="button"
                                                        >
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
                                                                    setShowImage(true);
                                                                    form.setFieldValue(
                                                                        "imageUrl",
                                                                        initialData.imageUrl,
                                                                    );
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
                                                    value={field.state.value}
                                                />
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        </>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                    <FieldGroup className="col-span-3">
                        <div className="max-w-full">
                            <form.Field
                                name="isActive"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <FieldLabel htmlFor={field.name}>
                                            <Field
                                                orientation="horizontal"
                                                data-invalid={isInvalid}
                                            >
                                                <FieldContent>
                                                    <FieldTitle>Active</FieldTitle>
                                                    <FieldDescription>
                                                        Turn off to disable this billboard without
                                                        deleting it.
                                                    </FieldDescription>
                                                    {isInvalid && (
                                                        <FieldError
                                                            errors={field.state.meta.errors}
                                                        />
                                                    )}
                                                </FieldContent>
                                                <Switch
                                                    id={field.name}
                                                    name={field.name}
                                                    checked={field.state.value}
                                                    onCheckedChange={field.handleChange}
                                                    aria-invalid={isInvalid}
                                                />
                                            </Field>
                                        </FieldLabel>
                                    );
                                }}
                            />
                        </div>
                    </FieldGroup>
                </div>
                <form.Subscribe
                    selector={(state) => [state.values]}
                    children={([values]) => {
                        const isDirty =
                            values.label !== (initialData?.label || "") ||
                            values.imageUrl !== (initialData?.imageUrl || "");

                        const isDisabled = initialData
                            ? !isDirty || edit.isPending
                            : create.isPending;

                        return (
                            <Button
                                disabled={isDisabled || remove.isPending || upload.isPending}
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
