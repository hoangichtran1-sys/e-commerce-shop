import { prisma } from "@/lib/prisma";
import { admin, base } from "@/orpc/init";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import { ORPCError } from "@orpc/client";

export const uploadsRouter = base.router({
    getAll: admin.handler(async () => {
        const images = await prisma.upload.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return images;
    }),
    delete: admin
        .input(
            z.object({
                uploadId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const existingImage = await prisma.upload.findUnique({
                where: {
                    id: input.uploadId,
                },
            });

            if (!existingImage) {
                throw new ORPCError("NOT_FOUND");
            }

            if (existingImage.isLinked) {
                throw new ORPCError("BAD_REQUEST", { message: "Image is in use" });
            }

            return await prisma.$transaction(async (tx) => {
                const imageDeleted = await tx.upload.delete({
                    where: { id: existingImage.id },
                });

                if (imageDeleted) {
                    await cloudinary.uploader.destroy(existingImage.publicId);
                }

                return imageDeleted;
            });
        }),
    bulkDelete: admin
        .input(
            z.object({
                uploadIds: z.array(z.string().min(1)),
            }),
        )
        .handler(async ({ input }) => {
            const existingImages = await prisma.upload.findMany({
                where: {
                    id: {
                        in: input.uploadIds,
                    },
                },
            });

            const imagesToLink = existingImages.filter((i) => i.isLinked);

            if (existingImages.length === 0) {
                throw new ORPCError("NOT_FOUND");
            }

            if (imagesToLink.length > 0) {
                throw new ORPCError("BAD_REQUEST", { message: "Some image is in use" });
            }

            return await prisma.$transaction(async (tx) => {
                const imagesBulkDeleted = await tx.upload.deleteMany({
                    where: {
                        id: {
                            in: existingImages.map((image) => image.id),
                        },
                    },
                });

                if (imagesBulkDeleted.count > 0) {
                    await Promise.all(existingImages.map((image) => cloudinary.uploader.destroy(image.publicId)));
                }

                return imagesBulkDeleted.count;
            });
        }),
    toggleIsLink: admin
        .input(
            z.object({
                uploadId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const existingImage = await prisma.upload.findUnique({
                where: {
                    id: input.uploadId,
                },
            });

            if (!existingImage) {
                throw new ORPCError("NOT_FOUND");
            }

            const toggleIsLinkImage = await prisma.upload.update({
                where: {
                    id: existingImage.id,
                },
                data: {
                    isLinked: !existingImage.isLinked,
                },
            });

            return toggleIsLinkImage;
        }),
});
