import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { createProductWithVariantsSchema, updateProductWithVariantsSchema, variantItemSchema } from "../schemas";
import { Prisma } from "@/generated/prisma/client";
import { checkDuplicate, generateSearchable, getMinPrice } from "@/lib/utils";

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
    create: admin.input(createProductWithVariantsSchema).handler(async ({ input }) => {
        const { storeId, categoryId, name, status, isFeatured, images, description, variants, features } = input;
        const skuInput = variants.map((variant) => variant.sku);

        const isDuplicateSku = checkDuplicate(skuInput);
        if (isDuplicateSku) {
            throw new ORPCError("CONFLICT");
        }

        const existing = await prisma.productVariant.findFirst({
            where: {
                storeId,
                sku: {
                    in: skuInput,
                },
            },
        });

        if (existing) {
            throw new ORPCError("CONFLICT");
        }

        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        });

        if (!category || category.parentId === null) {
            throw new ORPCError("BAD_REQUEST");
        }

        const searchableAttrs = generateSearchable(variants);
        const minPrice = getMinPrice(variants);
        const maxPrice = getMinPrice(variants);

        return await prisma.$transaction(async (tx) => {
            const productCreated = await tx.product.create({
                data: {
                    storeId,
                    categoryId,
                    name,
                    status,
                    isFeatured,
                    description,
                    maxPrice,
                    minPrice,
                    features,
                    searchableAttributes: searchableAttrs,
                    variants: {
                        createMany: {
                            data: variants.map((variant) => ({
                                storeId,
                                sku: variant.sku,
                                stock: variant.stock,
                                combination: variant.combination,
                                price: Prisma.Decimal(variant.price),
                            })),
                        },
                    },
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

            return productCreated;
        });
    }),
    update: admin.input(updateProductWithVariantsSchema).handler(async ({ input }) => {
        const { id, storeId, categoryId, name, status, isFeatured, images, description, variants, features } = input;

        const product = await prisma.product.findUnique({
            where: {
                id,
                storeId,
            },
        });

        if (!product) {
            throw new ORPCError("NOT_FOUND");
        }

        const searchableAttrs = generateSearchable(variants);
        const minPrice = getMinPrice(variants);
        const maxPrice = getMinPrice(variants);

        return await prisma.$transaction(async (tx) => {
            const oldImages = await tx.productImage.findMany({
                where: { productId: id },
            });
            const oldUrls = oldImages.map((img) => img.url);

            const productUpdated = await tx.product.update({
                where: { id },
                data: {
                    categoryId,
                    name,
                    status,
                    isFeatured,
                    description,
                    maxPrice,
                    minPrice,
                    features,
                    searchableAttributes: searchableAttrs,
                    variants: {
                        upsert: variants.map((variant) => ({
                            where: {
                                storeId_sku: {
                                    storeId,
                                    sku: variant.sku,
                                },
                            },
                            update: {
                                stock: variant.stock,
                                combination: variant.combination,
                                price: new Prisma.Decimal(variant.price),
                            },
                            create: {
                                storeId,
                                sku: variant.sku,
                                stock: variant.stock,
                                combination: variant.combination,
                                price: new Prisma.Decimal(variant.price),
                            },
                        })),
                    },
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

            return productUpdated;
        });
    }),
    updateVariants: admin
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
                variants: z.array(variantItemSchema).min(1),
            }),
        )
        .handler(async ({ input }) => {
            const { storeId, productId, variants } = input;
            const product = await prisma.product.findUnique({
                where: {
                    id: productId,
                    storeId,
                },
            });

            if (!product) {
                throw new ORPCError("NOT_FOUND");
            }

            const productUpdated = await prisma.product.update({
                where: { id: productId },
                data: {
                    variants: {
                        upsert: variants.map((variant) => ({
                            where: {
                                storeId_sku: {
                                    storeId,
                                    sku: variant.sku,
                                },
                            },
                            update: {
                                stock: variant.stock,
                                combination: variant.combination,
                                price: new Prisma.Decimal(variant.price),
                            },
                            create: {
                                storeId,
                                sku: variant.sku,
                                stock: variant.stock,
                                combination: variant.combination,
                                price: new Prisma.Decimal(variant.price),
                            },
                        })),
                    },
                },
            });

            return productUpdated;
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
    toggleFeatured: admin
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

            const toggleFeaturedProduct = await prisma.product.update({
                where: { id: input.id },
                data: {
                    isFeatured: !product.isFeatured,
                },
            });

            return toggleFeaturedProduct;
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
                    variants: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            parentId: true,
                        },
                    },
                },
            });

            if (!product) {
                return null;
            }

            return {
                ...product,
                minPrice: product.minPrice.toNumber(),
                maxPrice: product.maxPrice.toNumber(),
                variants: product.variants.map((variant) => ({
                    ...variant,
                    price: variant.price.toNumber(),
                })),
            };
        }),
    getMany: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const products = await prisma.product.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                category: {
                    include: {
                        parent: true,
                    },
                },
                variants: true,
                images: true,
                reviews: true,
                _count: {
                    select: {
                        reviews: true,
                        favorites: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const productsFormatted = products.map((product) => ({
            ...product,
            minPrice: product.minPrice.toNumber(),
            maxPrice: product.maxPrice.toNumber(),
            variants: product.variants.map((variant) => ({
                ...variant,
                price: variant.price.toNumber(),
            })),
        }));

        return productsFormatted;
    }),
});
