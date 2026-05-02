import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";

export const billboardsRouter = base.router({
    upload: admin
        .input(
            z.object({
                file: z
                    .instanceof(File)
                    .refine(
                        (file) => file.size <= 5 * 1024 * 1024,
                        "Max file size 5MB",
                    )
                    .refine(
                        (file) => file.type.startsWith("image/"),
                        "Image is required",
                    ),
            }),
        )
        .handler(async ({ input }) => {
            const { file } = input;

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise<UploadApiResponse>(
                (resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            { folder: "billboard" },
                            (
                                error: UploadApiErrorResponse | undefined,
                                result: UploadApiResponse | undefined,
                            ) => {
                                if (error) reject(error);
                                if (!result)
                                    return reject(new ORPCError("BAD_REQUEST"));
                                resolve(result);
                            },
                        )
                        .end(buffer);
                },
            );

            const newUpload = await prisma.upload.create({
                data: {
                    publicId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    mimetype: file.type,
                    size: file.size,
                    isLinked: false,
                    refType: "BILLBOARD",
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
                label: z.string().min(1),
                imageUrl: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const billboardCreated = await prisma.billboard.create({
                data: {
                    label: input.label,
                    imageUrl: input.imageUrl,
                    storeId: input.storeId,
                },
            });

            if (billboardCreated) {
                await prisma.upload.update({
                    where: {
                        url: billboardCreated.imageUrl,
                    },
                    data: {
                        isLinked: true,
                    },
                });
            }

            return billboardCreated;
        }),
    update: admin
        .input(
            z.object({
                id: z.string().min(1),
                label: z.string().min(1),
                newImageUrl: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const billboard = await prisma.billboard.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!billboard) {
                throw new ORPCError("NOT_FOUND");
            }

            const isImageChanged = input.newImageUrl !== billboard.imageUrl;

            const billboardUpdated = await prisma.billboard.update({
                where: {
                    id: input.id,
                },
                data: {
                    label: input.label,
                    imageUrl: input.newImageUrl,
                },
            });

            if (billboardUpdated && isImageChanged) {
                await Promise.all([
                    prisma.upload.update({
                        where: {
                            url: billboard.imageUrl,
                        },
                        data: {
                            isLinked: false,
                        },
                    }),
                    prisma.upload.update({
                        where: {
                            url: input.newImageUrl,
                        },
                        data: {
                            isLinked: true,
                        },
                    }),
                ]);
            }

            return billboardUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const billboard = await prisma.billboard.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!billboard) {
                throw new ORPCError("NOT_FOUND");
            }

            const billboardDeleted = await prisma.billboard.delete({
                where: {
                    id: input.id,
                },
            });

            if (billboardDeleted) {
                await prisma.upload.update({
                    where: {
                        url: billboardDeleted.imageUrl,
                    },
                    data: {
                        isLinked: false,
                    },
                });
            }

            return billboardDeleted;
        }),
    bulkDelete: admin
        .input(
            z.object({
                ids: z.array(z.string().min(1)),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const storeOwner = await prisma.store.findUnique({
                where: {
                    id: input.storeId,
                    userId: context.user.id,
                },
            });

            if (!storeOwner) {
                throw new ORPCError("UNAUTHORIZED");
            }

            const billboardsDeleted = await prisma.$transaction(async (tx) => {
                const results = [];

                for (const id of input.ids) {
                    const billboardDeleted = await tx.billboard.delete({
                        where: { id },
                    });

                    if (billboardDeleted) {
                        await tx.upload.update({
                            where: { url: billboardDeleted.imageUrl },
                            data: { isLinked: false },
                        });
                    }

                    results.push(billboardDeleted);
                }

                return results;
            });

            return {
                count: billboardsDeleted.length,
            };
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const billboard = await prisma.billboard.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            return billboard;
        }),
    getMany: admin
        .input(z.object({ storeId: z.string().min(1) }))
        .handler(async ({ input }) => {
            const billboards = await prisma.billboard.findMany({
                where: {
                    storeId: input.storeId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return billboards;
        }),
});
