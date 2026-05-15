import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { createProductSchema, updateProductSchema } from "../schemas";
import { Prisma } from "@/generated/prisma/client";

export const productsRouter = base.router({
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
                    .upload_stream({ folder: "products" }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                        if (error) reject(error);
                        if (!result) return reject(new ORPCError("BAD_REQUEST"));
                        resolve(result);
                    })
                    .end(buffer);
            });
            const uploadCreated = await prisma.upload.create({
                data: {
                    publicId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    mimetype: file.type,
                    size: file.size,
                    isLinked: false,
                    refType: "PRODUCT",
                },
            });

            return {
                url: uploadCreated.url,
                id: uploadCreated.id,
            };
        }),
    create: admin.input(createProductSchema).handler(async ({ input }) => {
        const { storeId, categoryId, sizeId, colorId, name, sku, price, status, inStock, isFeatured, images, description } = input;

        const existingProduct = await prisma.product.findUnique({
            where: {
                sku: input.sku,
            },
        });

        if (existingProduct) {
            throw new ORPCError("CONFLICT");
        }

        return await prisma.$transaction(async (tx) => {
            const productCreated = await tx.product.create({
                data: {
                    storeId,
                    categoryId,
                    sizeId,
                    colorId,
                    name,
                    sku,
                    price: Prisma.Decimal(price),
                    status,
                    inStock,
                    isFeatured,
                    description,
                },
            });

            if (images && images.length > 0) {
                await tx.upload.updateMany({
                    where: {
                        url: { in: images },
                    },
                    data: {
                        isLinked: true,
                    },
                });

                await tx.productImage.createMany({
                    data: images.map((url) => ({
                        productId: productCreated.id,
                        url,
                    })),
                });
            }

            return {
                ...productCreated,
                price: productCreated.price.toNumber(),
            };
        });
    }),
    update: admin.input(updateProductSchema).handler(async ({ input }) => {
        const { id, storeId, categoryId, sizeId, colorId, name, sku, price, status, inStock, isFeatured, images, description } = input;

        const product = await prisma.product.findUnique({
            where: {
                id,
                storeId,
            },
        });

        if (!product) {
            throw new ORPCError("NOT_FOUND");
        }

        return await prisma.$transaction(async (tx) => {
            const oldImages = await tx.productImage.findMany({
                where: { productId: id },
            });
            const oldUrls = oldImages.map((img) => img.url);

            const productUpdated = await tx.product.update({
                where: { id },
                data: {
                    categoryId,
                    sizeId,
                    colorId,
                    name,
                    sku,
                    price: Prisma.Decimal(price),
                    status,
                    inStock,
                    isFeatured,
                    description,
                },
            });

            await tx.productImage.deleteMany({
                where: { productId: id },
            });

            await tx.productImage.createMany({
                data: images.map((url) => ({
                    productId: id,
                    url,
                })),
            });

            await tx.upload.updateMany({
                where: { url: { in: images } },
                data: { isLinked: true },
            });

            const discardedUrls = oldUrls.filter((url) => !images.includes(url));
            if (discardedUrls.length > 0) {
                await tx.upload.updateMany({
                    where: { url: { in: discardedUrls } },
                    data: { isLinked: false },
                });
            }

            return {
                ...productUpdated,
                price: productUpdated.price.toNumber(),
            };
        });
    }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const product = await prisma.product.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!product) {
                throw new ORPCError("NOT_FOUND");
            }

            const productDeleted = await prisma.product.delete({
                where: {
                    id: input.id,
                },
                select: {
                    images: {
                        select: {
                            url: true,
                        },
                    },
                    id: true,
                },
            });

            if (productDeleted && productDeleted.images.length > 0) {
                await prisma.upload.updateMany({
                    where: {
                        url: {
                            in: productDeleted.images.map((image) => image.url),
                        },
                    },
                    data: {
                        isLinked: false,
                    },
                });
            }

            return productDeleted;
        }),
    toggleInStock: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const product = await prisma.product.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });
            if (!product) {
                throw new ORPCError("NOT_FOUND");
            }

            const toggleInStockProduct = await prisma.product.update({
                where: { id: input.id },
                data: {
                    inStock: !product.inStock,
                },
            });

            return toggleInStockProduct;
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const product = await prisma.product.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
                include: {
                    images: true,
                },
            });

            if (!product) {
                return null;
            }

            return {
                ...product,
                price: product.price.toNumber(),
            };
        }),
    getMany: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const products = await prisma.product.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                category: true,
                size: true,
                color: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const productsFormatted = products.map((product) => ({
            ...product,
            price: product.price.toNumber(),
        }));

        return productsFormatted;
    }),
    getManyByCategory: admin
        .input(
            z.object({
                storeId: z.string().min(1),
                categoryId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const products = await prisma.product.findMany({
                where: {
                    storeId: input.storeId,
                    categoryId: input.categoryId,
                    status: "PUBLISHED",
                },
                include: {
                    category: true,
                    size: true,
                    color: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            const productsFormatted = products.map((product) => ({
                ...product,
                price: product.price.toNumber(),
            }));

            return productsFormatted;
        }),
});
