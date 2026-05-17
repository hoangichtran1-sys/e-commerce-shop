import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import slug from "slug";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";

export const storesRouter = base.router({
    upload: admin
        .input(
            z.object({
                file: z
                    .instanceof(File)
                    .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size 5MB")
                    .refine((file) => file.type.startsWith("image/"), "Type image is required"),
            }),
        )
        .handler(async ({ input }) => {
            const { file } = input;

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream({ folder: "stores" }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                        if (error) reject(error);
                        if (!result) return reject(new ORPCError("BAD_REQUEST"));
                        resolve(result);
                    })
                    .end(buffer);
            });

            const newUpload = await prisma.upload.create({
                data: {
                    publicId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    mimetype: file.type,
                    size: file.size,
                    isLinked: false,
                    refType: "STORE",
                },
            });

            return {
                url: newUpload.url,
                id: newUpload.id,
            };
        }),
    create: admin
        .input(
            z.object({
                name: z.string(),
            }),
        )
        .handler(async ({ input, context }) => {
            const existingStore = await prisma.store.findFirst({
                where: {
                    slug: slug(input.name),
                    userId: context.user.id,
                },
            });

            if (existingStore) {
                throw new ORPCError("CONFLICT");
            }

            const storeCreated = await prisma.store.create({
                data: {
                    name: input.name,
                    userId: context.user.id,
                    slug: slug(input.name),
                },
            });

            return storeCreated;
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const store = await prisma.store.findUnique({
                where: {
                    id: input.id,
                    userId: context.user.id,
                },
            });

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            return store;
        }),
    getMany: admin.handler(async ({ context }) => {
        const stores = await prisma.store.findMany({
            where: {
                userId: context.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return stores;
    }),
    update: admin
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
                description: z.string().nullable(),
                thumbnailUrl: z.string().min(1).nullable(),
            }),
        )
        .handler(async ({ input, context }) => {
            const store = await prisma.store.findUnique({
                where: {
                    id: input.id,
                    userId: context.user.id,
                },
            });

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            const isThumbnailChanged = input.thumbnailUrl && store.thumbnail && input.thumbnailUrl !== store.thumbnail;

            const storeUpdated = await prisma.store.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    description: input.description,
                    slug: slug(input.name),
                    thumbnail: input.thumbnailUrl,
                },
            });

            if (input.thumbnailUrl && store.thumbnail && storeUpdated && isThumbnailChanged) {
                await Promise.all([
                    prisma.upload.update({
                        where: {
                            url: store.thumbnail,
                        },
                        data: {
                            isLinked: false,
                        },
                    }),
                    prisma.upload.update({
                        where: {
                            url: input.thumbnailUrl,
                        },
                        data: {
                            isLinked: true,
                        },
                    }),
                ]);
            }

            return storeUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const store = await prisma.store.findUnique({
                where: {
                    id: input.id,
                    userId: context.user.id,
                },
            });

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            const storeDeleted = await prisma.store.delete({
                where: {
                    id: input.id,
                },
            });

            return storeDeleted;
        }),
});
