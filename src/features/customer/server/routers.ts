import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { base, authed } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { sortMap, sortValues } from "../types";

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
        const now = new Date();

        const categories = await prisma.category.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                billboard: true,
                promotions: {
                    where: {
                        isActive: true,
                        startAt: { lte: now },
                        endAt: { gte: now },
                    },
                    orderBy: [{ priority: "desc" }, { value: "desc" }],
                    take: 1,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return categories;
    }),
    getBillboardGlobal: base.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const billboard = await prisma.billboard.findMany({
            where: {
                storeId: input.storeId,
                isGlobal: true,
                isActive: true,
            },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
            take: 1,
        });

        return billboard[0];
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
                sort: z.literal(sortValues).default("newest"),
            }),
        )
        .handler(async ({ input }) => {
            const { storeId, categoryId, colorId, sizeId, isFeatured, minPrice, maxPrice, search, sort } = input;
            const now = new Date();

            const hasMin = minPrice !== null && minPrice !== undefined;
            const hasMax = maxPrice !== null && maxPrice !== undefined;

            if ((hasMin && !hasMax) || (!hasMin && hasMax)) {
                throw new ORPCError("BAD_REQUEST", { message: "Invalid price range" });
            }

            if (hasMin && hasMax && minPrice > maxPrice) {
                throw new ORPCError("BAD_REQUEST", { message: "Min price must be before max price" });
            }

            const queryProducts: Prisma.ProductWhereInput = { storeId, status: "PUBLISHED" };

            if (categoryId) {
                queryProducts.categoryId = categoryId;
            }

            if (isFeatured !== undefined && isFeatured !== null) {
                queryProducts.isFeatured = isFeatured;
            }

            if (colorId) {
                queryProducts.colorId = colorId;
            }

            if (sizeId) {
                queryProducts.sizeId = sizeId;
            }

            if (search) {
                queryProducts.name = { contains: search, mode: "insensitive" };
            }

            if (hasMax && hasMin) {
                queryProducts.price = { gte: minPrice, lte: maxPrice };
            }

            const products = await prisma.product.findMany({
                where: queryProducts,
                include: {
                    images: true,
                    category: {
                        include: {
                            promotions: {
                                where: {
                                    isActive: true,
                                    startAt: { lte: now },
                                    endAt: { gte: now },
                                },
                                orderBy: [{ priority: "desc" }, { value: "desc" }],
                                take: 1,
                            },
                        },
                    },
                },
                orderBy: sortMap[sort],
            });

            return products.map((item) => ({
                ...item,
                price: item.price.toNumber(),
            }));
        }),
    getProduct: base.input(z.object({ storeId: z.string().min(1), productId: z.string().min(1) })).handler(async ({ input }) => {
        const now = new Date();

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
                                isActive: true,
                                startAt: { lte: now },
                                endAt: { gte: now },
                            },
                            orderBy: [{ priority: "desc" }, { value: "desc" }],
                            take: 1,
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
