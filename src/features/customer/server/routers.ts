import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { base, authed } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const customerRouter = base.router({
    getStoreBySlug: base
        .input(
            z.object({
                slug: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const store = await prisma.store.findUnique({
                where: {
                    slug: input.slug,
                },
            });

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            return store;
        }),
    getStores: base.handler(async () => {
        const stores = await prisma.store.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return stores;
    }),
    getCategoriesInStore: base.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const categories = await prisma.category.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                billboard: true,
                promotions: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return categories;
    }),
    getBillboardGlobal: base.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const billboards = await prisma.billboard.findMany({
            where: {
                storeId: input.storeId,
                isGlobal: true,
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (billboards.length === 0) {
            return null;
        }

        return billboards[0];
    }),
    getProducts: base
        .input(
            z.object({
                storeId: z.string().min(1),
                categoryId: z.string().min(1).nullish(),
                colorId: z.string().min(1).nullish(),
                sizeId: z.string().min(1).nullish(),
                isFeatured: z.boolean().nullish(),
                maxPrice: z.number().nullish(),
                minPrice: z.number().nullish(),
                search: z.string().nullish(),
            }),
        )
        .handler(async ({ input }) => {
            const { storeId, categoryId, colorId, sizeId, isFeatured, minPrice, maxPrice, search } = input;

            if ((minPrice && !maxPrice) || (!minPrice && maxPrice)) {
                throw new ORPCError("BAD_REQUEST", { message: "Invalid price range" });
            }

            if (minPrice && maxPrice && minPrice > maxPrice) {
                throw new ORPCError("BAD_REQUEST", { message: "Min price must be before max price" });
            }

            const queryProducts: Prisma.ProductWhereInput = { storeId };

            if (categoryId) {
                queryProducts.categoryId = categoryId;
            }

            if (isFeatured) {
                queryProducts.isFeatured = isFeatured;
            }

            const products = await prisma.product.findMany({
                where: queryProducts,
                include: {
                    images: true,
                    category: {
                        include: {
                            promotions: {
                                where: {
                                    AND: {
                                        isActive: true,
                                        startAt: { lte: new Date() },
                                        endAt: { gte: new Date() },
                                    },
                                },
                                orderBy: {
                                    value: "desc",
                                },
                            },
                        },
                    },
                },
            });

            return products.map((item) => ({
                ...item,
                price: item.price.toNumber(),
            }));
        }),
    getProduct: base.input(z.object({ storeId: z.string().min(1), productId: z.string().min(1) })).handler(async ({ input }) => {
        const product = await prisma.product.findUnique({
            where: {
                id: input.productId,
                storeId: input.storeId,
            },
            include: {
                images: true,
                category: {
                    include: {
                        promotions: {
                            where: {
                                AND: {
                                    isActive: true,
                                    startAt: { lte: new Date() },
                                    endAt: { gte: new Date() },
                                },
                            },
                            orderBy: {
                                value: "desc",
                            },
                        },
                    },
                },
                color: true,
                size: true,
                reviews: {
                    include: { user: { select: { email: true, name: true, image: true } } },
                },
            },
        });

        if (!product) {
            throw new ORPCError("NOT_FOUND");
        }

        return {
            ...product,
            price: product.price.toNumber(),
        };
    }),
    getCategory: base.input(z.object({ storeId: z.string().min(1), categoryId: z.string().min(1) })).handler(async ({ input }) => {
        const category = await prisma.category.findUnique({
            where: {
                id: input.categoryId,
                storeId: input.storeId,
            },
            include: {
                billboard: true,
                colors: true,
                sizes: true,
            },
        });

        if (!category) {
            throw new ORPCError("NOT_FOUND");
        }

        return category;
    }),
    insertReview: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
                rating: z.number().int().min(1).max(5),
                feedback: z.string().trim().max(1000).nullable(),
            }),
        )
        .handler(async ({ context, input }) => {
            const existingReview = await prisma.review.findUnique({
                where: {
                    storeId_userId_productId: {
                        storeId: input.storeId,
                        productId: input.productId,
                        userId: context.user.id,
                    },
                },
            });

            if (existingReview) {
                throw new ORPCError("CONFLICT");
            }

            const reviewCreated = await prisma.review.create({
                data: {
                    storeId: input.storeId,
                    productId: input.productId,
                    userId: context.user.id,
                    rating: input.rating,
                    feedback: input.feedback,
                },
            });

            return reviewCreated;
        }),
    updateReview: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
                rating: z.number().int().min(1).max(5),
                feedback: z.string().trim().max(1000).nullable(),
            }),
        )
        .handler(async ({ context, input }) => {
            const existingReview = await prisma.review.findUnique({
                where: {
                    storeId_userId_productId: {
                        storeId: input.storeId,
                        productId: input.productId,
                        userId: context.user.id,
                    },
                },
            });

            if (!existingReview) {
                throw new ORPCError("NOT_FOUND");
            }

            const reviewUpdated = await prisma.review.update({
                where: {
                    id: existingReview.id,
                },
                data: {
                    rating: input.rating,
                    feedback: input.feedback,
                },
            });

            return reviewUpdated;
        }),
    getReview: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const existingReview = await prisma.review.findUnique({
                where: {
                    storeId_userId_productId: {
                        storeId: input.storeId,
                        productId: input.productId,
                        userId: context.user.id,
                    },
                },
            });

            return existingReview;
        }),
});
