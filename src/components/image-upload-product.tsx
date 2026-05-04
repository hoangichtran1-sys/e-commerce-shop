"use client";

import { ImagePlus, Loader2Icon, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { FileUpload, FileUploadTrigger } from "@/components/ui/file-upload";
import { toast } from "sonner";

interface ImageUploadProductProps {
    previews: string[];
    setPreviews: (previews: string[]) => void;
    onUpload: (files: File[]) => void;
    isUploading?: boolean;
}

export const ImageUploadProduct = ({
    previews,
    setPreviews,
    onUpload,
    isUploading,
}: ImageUploadProductProps) => {
    const handleRemove = (index: number) => {
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const onFileReject = React.useCallback((file: File, message: string) => {
        toast.error(message, {
            description: `Cannot add "${file.name}". Remove a file first.`,
        });
    }, []);

    return (
        <div className="w-full max-w-md">
            <FileUpload
                value={[]}
                onValueChange={onUpload}
                onFileReject={onFileReject}
                accept="image/*"
                maxFiles={3}
                maxSize={5 * 1024 * 1024}
                multiple
            >
                <div className="grid grid-cols-3 gap-2">
                    {previews.map((url, index) => (
                        <div
                            key={index}
                            className="group relative aspect-square"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt={`Product image ${index}`}
                                className="h-full w-full rounded-lg object-cover"
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => handleRemove(index)}
                                type="button"
                            >
                                <X className="size-3" />
                            </Button>
                        </div>
                    ))}
                    {previews.length < 3 && (
                        <FileUploadTrigger asChild>
                            <button
                                type="button"
                                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors hover:border-primary hover:bg-primary/5"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2Icon className="size-6 text-muted-foreground animate-spin" />
                                        <span className="text-xs text-muted-foreground">
                                            Uploading
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus className="size-6 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            Add
                                        </span>
                                    </>
                                )}
                            </button>
                        </FileUploadTrigger>
                    )}
                </div>
            </FileUpload>
            <p className="mt-2 text-center text-xs text-muted-foreground">
                {previews.length}/3 images
            </p>
        </div>
    );
};
