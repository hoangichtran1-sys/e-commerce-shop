/* eslint-disable @next/next/no-img-element */
"use client";

import { ImageIcon, Loader2Icon, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemPreview,
    FileUploadItemMetadata,
    FileUploadList,
    FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback } from "react";
import { toast } from "sonner";

interface ImageUploadBillboardProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    isUploading?: boolean;
}

export const ImageUploadBillboard = ({
    files,
    onFilesChange,
    isUploading,
}: ImageUploadBillboardProps) => {
    const onFileReject = useCallback((file: File, message: string) => {
        toast.error(message, {
            description: `Cannot add "${file.name}". Remove a file first.`,
        });
    }, []);

    return (
        <FileUpload
            accept="image/*"
            maxFiles={1}
            maxSize={5 * 1024 * 1024}
            className="w-full max-w-md"
            value={files}
            onValueChange={onFilesChange}
            onFileReject={onFileReject}
            multiple
        >
            <FileUploadDropzone>
                <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                        <ImageIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Upload image</p>
                    <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 5MB
                    </p>
                </div>
                <FileUploadTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Loader2Icon className="size-4 text-muted-foreground animate-spin" />
                        ) : (
                            "Select Image"
                        )}
                    </Button>
                </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
                {files.map((file, index) => (
                    <FileUploadItem key={index} value={file}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="group relative cursor-pointer"
                                >
                                    <FileUploadItemPreview className="size-12 rounded-md" />
                                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <ZoomIn className="size-4 text-white" />
                                    </div>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogTitle className="sr-only">
                                    {file.name}
                                </DialogTitle>
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full rounded-lg"
                                />
                            </DialogContent>
                        </Dialog>
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                type="button"
                            >
                                <X className="size-4" />
                            </Button>
                        </FileUploadItemDelete>
                    </FileUploadItem>
                ))}
            </FileUploadList>
            <p className="text-center text-xs text-muted-foreground">
                {files.length}/1 files selected
            </p>
        </FileUpload>
    );
};
