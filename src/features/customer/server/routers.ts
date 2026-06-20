/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, ReviewReportReason } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { base, authed } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { CheckoutMetadata, DiscountSnapshot, featuresValue, reviewsFilter, sortMap, sortValues } from "../types";
import { applyPromotion } from "@/lib/utils";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { generateOrderCode } from "@/lib/generate-order-code";
import { FAVORITE_BREAKPOINT, MAX_LIMIT, MIN_LIMIT, PAGINATION, RATING_BREAKPOINT, REPORT_BREAKPOINT } from "@/constants";
import { sendEmail } from "@/lib/send-mail";

export const customerRouter = base.router({
    getOrdersHistory: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            }),
        )
        .handler(async ({ input, context }) => {
            const { page, pageSize } = input;

            const [orders, totalCount] = await Promise.all([
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        userId: context.user.id,
                        status: {
                            notIn: ["PENDING"],
                        },
                    },
                    include: {
                        orderItems: {
                            include: {
                                productVariant: {
                                    select: {
                                        product: {
                                            select: {
                                                images: {
                                                    select: {
                                                        url: true,
                                                    },
                                                    take: 1,
                                                },
                                                name: true,
                                            },
                                        },
                                        sku: true,
                                        combination: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: { orderItems: true },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                prisma.order.count({
                    where: {
                        storeId: input.storeId,
                        userId: context.user.id,
                        status: {
                            notIn: ["PENDING"],
                        },
                    },
                }),
            ]);

            const items = orders.map((order) => ({
                ...order,
                amountPaid: order.amountPaid?.toNumber(),
                orderItems: order.orderItems.map((item) => ({
                    ...item,
                    originalPrice: item.originalPrice.toNumber(),
                    finalPrice: item.finalPrice.toNumber(),
                })),
            }));

            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            };
        }),
    checkout: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                productVariantItems: z.array(
                    z.object({
                        productVariantId: z.string().min(1),
                        quantity: z.number().int().min(1),
                    }),
                ),
                couponId: z.string().min(1).nullable(),
            }),
        )
        .handler(async ({ input, context }) => {
            const now = new Date();

            const [productVariants, coupon, store] = await Promise.all([
                prisma.productVariant.findMany({
                    where: {
                        storeId: input.storeId,
                        id: {
                            in: input.productVariantItems.map((item) => item.productVariantId),
                        },
                    },
                    include: {
                        product: {
                            select: {
                                name: true,
                                description: true,
                                images: {
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
                                },
                                category: {
                                    select: {
                                        name: true,
                                        parent: {
                                            select: {
                                                promotions: {
                                                    where: {
                                                        isActive: true,
                                                        startAt: { lte: now },
                                                        endAt: { gte: now },
                                                    },
                                                    select: {
                                                        maxDiscountValue: true,
                                                        type: true,
                                                        value: true,
                                                    },
                                                    orderBy: [{ priority: "desc" }, { value: "desc" }],
                                                    take: 1,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
                input.couponId
                    ? prisma.coupon.findUnique({
                          where: {
                              id: input.couponId,
                              storeId: input.storeId,
                          },
                          include: {
                              promotion: true,
                          },
                      })
                    : null,
                prisma.store.findUnique({
                    where: {
                        id: input.storeId,
                    },
                    select: {
                        slug: true,
                    },
                }),
            ]);

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            if (productVariants.length === 0) {
                throw new ORPCError("NOT_FOUND");
            }

            const productVariantsWithQuantity = productVariants.map((variant) => ({
                variantId: variant.id,
                combination: variant.combination as Record<string, string>,
                stock: variant.stock,
                price: variant.price.toNumber(),
                image: variant.product.images[0],
                name: variant.product.name,
                description: variant.product.description,
                category: variant.product.category.name,
                finalPrice:
                    applyPromotion(variant.price.toNumber(), variant.product.category.parent?.promotions[0])?.finalPrice ?? variant.price.toNumber(),
                discount: applyPromotion(variant.price.toNumber(), variant.product.category.parent?.promotions[0])?.discountValue ?? 0,
                quantity: input.productVariantItems.find((item) => item.productVariantId === variant.id)?.quantity ?? 1,
            }));

            const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
            const stripeDiscounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

            productVariantsWithQuantity.forEach((variant) => {
                line_items.push({
                    quantity: variant.quantity,
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${variant.name} ${Object.entries(variant.combination)
                                .map(([_, val]) => val)
                                .join(" • ")}`,
                            description: variant.category,
                            images: Object.values(variant.image),
                        },
                        unit_amount: Math.round(variant.finalPrice * 100),
                    },
                });
            });

            const subtotal = productVariantsWithQuantity.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
            const shipping = subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : env.SHIPPING_FEE;

            if (shipping > 0) {
                line_items.push({
                    quantity: 1,
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Shipping Fee",
                        },
                        unit_amount: Math.round(shipping * 100),
                    },
                });
            }
            let discountCoupon: number = 0;

            if (coupon) {
                const promotion = coupon.promotion;

                if (!promotion.isActive || promotion.startAt > now || promotion.endAt < now) {
                    throw new ORPCError("BAD_REQUEST", { message: "Invalid promotion" });
                }

                if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
                    throw new ORPCError("BAD_REQUEST", {
                        message: "Coupon usage limit exceeded",
                    });
                }

                const userUsedCount = await prisma.order.count({
                    where: {
                        couponId: coupon.id,
                        userId: context.user.id,
                        status: {
                            notIn: ["PENDING", "CANCELLED"],
                        },
                    },
                });

                if (coupon.perUserLimit !== null && userUsedCount >= coupon.perUserLimit) {
                    throw new ORPCError("BAD_REQUEST", {
                        message: "Per-user coupon limit exceeded",
                    });
                }

                if (subtotal < promotion.minOrderValue) {
                    throw new ORPCError("BAD_REQUEST", {
                        message: "Minimum order value not reached",
                    });
                }

                if (promotion.type === "FIXED") {
                    discountCoupon = promotion.value;
                }

                if (promotion.type === "PERCENT") {
                    discountCoupon = (subtotal * promotion.value) / 100;

                    if (promotion.maxDiscountValue !== null) {
                        discountCoupon = Math.min(discountCoupon, promotion.maxDiscountValue);
                    }
                }

                discountCoupon = Math.min(discountCoupon, subtotal);

                if (discountCoupon > 0) {
                    const stripeCoupon = await stripe.coupons.create({
                        amount_off: Math.round(discountCoupon * 100),
                        currency: "usd",
                        duration: "once",
                        name: `Code: ${coupon.code}`,
                    });
                    stripeDiscounts.push({
                        coupon: stripeCoupon.id,
                    });
                }
            }

            let stripeCustomer = await prisma.stripeCustomer.findUnique({
                where: {
                    userId: context.user.id,
                },
                select: {
                    stripeCustomerId: true,
                },
            });

            if (!stripeCustomer) {
                const customer = await stripe.customers.create({
                    email: context.user.email,
                });

                stripeCustomer = await prisma.stripeCustomer.create({
                    data: {
                        userId: context.user.id,
                        stripeCustomerId: customer.id,
                    },
                });
            }

            const orderCode = await generateOrderCode(input.storeId);

            return await prisma.$transaction(async (tx) => {
                const orderCreated = await tx.order.create({
                    data: {
                        orderCode,
                        storeId: input.storeId,
                        couponId: input.couponId,
                        userId: context.user.id,
                        status: "PENDING",
                        discountSnapshot: {
                            subtotal: subtotal,
                            savings: productVariantsWithQuantity.reduce((sum, item) => sum + (item.price - item.finalPrice) * item.quantity, 0),
                            shippingFee: shipping,
                            discountCoupon: discountCoupon,
                            total: subtotal + shipping - discountCoupon,
                        } as DiscountSnapshot,
                        orderItems: {
                            create: productVariantsWithQuantity.map((variant) => ({
                                productVariant: {
                                    connect: {
                                        id: variant.variantId,
                                    },
                                },
                                originalPrice: variant.price,
                                finalPrice: variant.finalPrice,
                                quantity: variant.quantity,
                            })),
                        },
                    },
                });

                const checkout = await stripe.checkout.sessions.create({
                    customer: stripeCustomer.stripeCustomerId,
                    success_url: `${env.APP_URL}/${store.slug}/cart?success=true`,
                    cancel_url: `${env.APP_URL}/${store.slug}/cart?cancel=true`,
                    mode: "payment",
                    line_items: line_items,
                    discounts: stripeDiscounts,
                    billing_address_collection: "required",
                    phone_number_collection: {
                        enabled: true,
                    },
                    invoice_creation: {
                        enabled: true,
                    },
                    metadata: {
                        orderId: orderCreated.id,
                    } as CheckoutMetadata,
                });

                if (!checkout.url) {
                    throw new ORPCError("INTERNAL_SERVER_ERROR");
                }

                return {
                    url: checkout.url,
                };
            });
        }),
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
    getCategoryId: base
        .input(
            z.object({
                slug: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const category = await prisma.category.findUnique({
                where: {
                    storeId_slug: {
                        storeId: input.storeId,
                        slug: input.slug,
                    },
                },
            });

            if (!category) {
                throw new ORPCError("NOT_FOUND");
            }

            return category.id;
        }),
    getStores: base
        .input(
            z.object({
                search: z.string().nullish(),
            }),
        )
        .handler(async ({ input }) => {
            const [stores, productSoldWithStore] = await Promise.all([
                prisma.store.findMany({
                    where: {
                        ...(input.search ? { name: { contains: input.search, mode: "insensitive" } } : {}),
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                }),
                prisma.product.groupBy({
                    by: ["storeId"],
                    _sum: {
                        soldCount: true,
                    },
                }),
            ]);

            return stores.map((item) => ({
                ...item,
                productSold: productSoldWithStore.find((p) => p.storeId === item.id)?._sum.soldCount || 0,
            }));
        }),
    getCategoriesParent: base.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const categories = await prisma.category.findMany({
            where: {
                storeId: input.storeId,
                parentId: null,
            },
            include: {
                billboard: true,
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
    getProductsRelated: base
        .input(z.object({ storeId: z.string().min(1), categoryIds: z.array(z.string().min(1)), productCurrentIds: z.array(z.string().min(1)) }))
        .handler(async ({ input }) => {
            const products = await prisma.product.findMany({
                where: {
                    storeId: input.storeId,
                    categoryId: {
                        in: input.categoryIds,
                    },
                },
                select: {
                    name: true,
                    id: true,
                    minPrice: true,
                    maxPrice: true,
                    averageRating: true,
                    reviewCount: true,
                    favoriteCount: true,
                    images: {
                        select: {
                            url: true,
                        },
                        take: 1,
                    },
                },
                take: 4,
                orderBy: {
                    createdAt: "desc",
                },
            });

            const productsRelated = products.filter((product) => !input.productCurrentIds.includes(product.id));

            return productsRelated;
        }),
    getProducts: base
        .input(
            z.object({
                storeId: z.string().min(1),
                categoryId: z.string().min(1).nullish(),
                isFeatured: z.boolean().nullish(),
                maxPrice: z.number().nullish(),
                minPrice: z.number().nullish(),
                search: z.string().nullish(),
                sort: z.literal(sortValues).default("newest"),
                colors: z.array(z.string()).optional().default([]),
                sizes: z.array(z.string()).optional().default([]),
                subcategorySlugs: z.array(z.string()).optional().default([]),
                features: z.array(z.enum(featuresValue)).optional().default([]),
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            }),
        )
        .handler(async ({ input }) => {
            const { storeId, categoryId, colors, sizes, minPrice, maxPrice, search, sort, subcategorySlugs, isFeatured, features, page, pageSize } =
                input;
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
            const andAttributeConditions: any[] = [];

            if (colors && colors.length > 0) {
                andAttributeConditions.push({
                    searchableAttributes: {
                        hasSome: colors.map((val) => `color:${val.trim()}`),
                    },
                });
            }

            if (sizes && sizes.length > 0) {
                andAttributeConditions.push({
                    searchableAttributes: {
                        hasSome: sizes.map((val) => `size:${val.trim()}`),
                    },
                });
            }

            if (features.includes("top_favorite")) {
                queryProducts.favoriteCount = { gte: FAVORITE_BREAKPOINT };
            }

            if (features.includes("top_rated")) {
                queryProducts.averageRating = { gte: RATING_BREAKPOINT };
            }

            if (features.includes("free_shipping")) {
                queryProducts.minPrice = { gte: env.SHIPPING_FEE };
            }

            if (features.includes("top_trending")) {
                queryProducts.isTrending = true;
            }

            if (isFeatured !== undefined && isFeatured !== null) {
                queryProducts.isFeatured = isFeatured;
            }

            if (categoryId) {
                queryProducts.category = { parentId: categoryId };
            }

            if (subcategorySlugs.length > 0) {
                queryProducts.category = { slug: { in: subcategorySlugs } };
            }

            if (search) {
                queryProducts.name = { contains: search, mode: "insensitive" };
            }

            if (hasMax && hasMin) {
                queryProducts.AND = [{ maxPrice: { gte: minPrice } }, { minPrice: { lte: maxPrice } }];
            }

            if (andAttributeConditions.length > 0) {
                queryProducts.AND = andAttributeConditions;
            }

            if (features.length > 0) {
                console.log(features);
            }

            const products = await prisma.product.findMany({
                where: queryProducts,
                include: {
                    variants: {
                        select: {
                            stock: true,
                        },
                    },
                    images: true,
                    category: {
                        include: {
                            parent: {
                                select: {
                                    promotions: {
                                        where: {
                                            isActive: true,
                                            startAt: { lte: now },
                                            endAt: { gte: now },
                                        },
                                        select: {
                                            maxDiscountValue: true,
                                            type: true,
                                            value: true,
                                        },
                                        orderBy: [{ priority: "desc" }, { value: "desc" }],
                                        take: 1,
                                    },
                                },
                            },
                        },
                    },
                    _count: {
                        select: { variants: true },
                    },
                },
                orderBy: sortMap[sort],
                skip: (page - 1) * pageSize,
                take: pageSize,
            });

            const totalPages = Math.ceil(products.length / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            const items = products.map((product) => ({
                ...product,
                minPrice: product.minPrice.toNumber(),
                maxPrice: product.maxPrice.toNumber(),
            }));

            return {
                items,
                page,
                pageSize,
                totalCount: items.length,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            };
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
                variants: true,
                category: {
                    select: {
                        name: true,
                        parent: {
                            select: {
                                name: true,
                                promotions: {
                                    where: {
                                        isActive: true,
                                        startAt: { lte: now },
                                        endAt: { gte: now },
                                    },
                                    select: {
                                        maxDiscountValue: true,
                                        type: true,
                                        value: true,
                                    },
                                    orderBy: [{ priority: "desc" }, { value: "desc" }],
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                favorites: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!product) {
            throw new ORPCError("NOT_FOUND");
        }

        return {
            ...product,
            variants: product.variants.map((variant) => ({
                ...variant,
                price: variant.price.toNumber(),
            })),
            minPrice: product.minPrice.toNumber(),
            maxPrice: product.maxPrice.toNumber(),
        };
    }),
    getVariantsInCart: base
        .input(
            z.object({
                storeId: z.string().min(1),
                variantIds: z.array(z.string()),
            }),
        )
        .handler(async ({ input }) => {
            const now = new Date();

            const variants = await prisma.productVariant.findMany({
                where: {
                    storeId: input.storeId,
                    id: {
                        in: input.variantIds,
                    },
                },
                select: {
                    id: true,
                    combination: true,
                    stock: true,
                    sku: true,
                    price: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            categoryId: true,
                            images: {
                                select: {
                                    url: true,
                                },
                                take: 1,
                            },
                            favorites: {
                                select: {
                                    userId: true,
                                },
                            },
                            category: {
                                select: {
                                    name: true,
                                    parent: {
                                        select: {
                                            promotions: {
                                                where: {
                                                    isActive: true,
                                                    startAt: { lte: now },
                                                    endAt: { gte: now },
                                                },
                                                select: {
                                                    maxDiscountValue: true,
                                                    type: true,
                                                    value: true,
                                                },
                                                orderBy: [{ priority: "desc" }, { value: "desc" }],
                                                take: 1,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            return variants.map((variant) => ({
                variantId: variant.id,
                combination: variant.combination as Record<string, string>,
                stock: variant.stock,
                price: variant.price.toNumber(),
                image: variant.product.images[0],
                name: variant.product.name,
                category: variant.product.category.name,
                categoryId: variant.product.categoryId,
                productId: variant.product.id,
                favorites: variant.product.favorites,
                finalPrice:
                    applyPromotion(variant.price.toNumber(), variant.product.category.parent?.promotions[0])?.finalPrice ?? variant.price.toNumber(),
                discount: applyPromotion(variant.price.toNumber(), variant.product.category.parent?.promotions[0])?.discountValue ?? 0,
            }));
        }),
    applyCouponCode: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                code: z
                    .string()
                    .trim()
                    .uppercase()
                    .min(3)
                    .max(20)
                    .regex(/^[A-Z0-9]+$/),
                subtotal: z.number().positive(),
            }),
        )
        .handler(async ({ input, context }) => {
            const now = new Date();
            let discount = 0;

            const coupon = await prisma.coupon.findUnique({
                where: {
                    storeId_code: {
                        storeId: input.storeId,
                        code: input.code,
                    },
                },
                include: {
                    promotion: true,
                },
            });

            if (!coupon) {
                throw new ORPCError("NOT_FOUND");
            }

            const promotion = coupon.promotion;

            if (!promotion.isActive || promotion.startAt > now || promotion.endAt < now) {
                throw new ORPCError("BAD_REQUEST", { message: "Invalid promotion" });
            }

            if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
                throw new ORPCError("BAD_REQUEST", {
                    message: "Coupon usage limit exceeded",
                });
            }

            const userUsedCount = await prisma.order.count({
                where: {
                    couponId: coupon.id,
                    userId: context.user.id,
                    status: {
                        notIn: ["PENDING", "CANCELLED"],
                    },
                },
            });

            if (coupon.perUserLimit !== null && userUsedCount >= coupon.perUserLimit) {
                throw new ORPCError("BAD_REQUEST", {
                    message: "Per-user coupon limit exceeded",
                });
            }

            if (input.subtotal < promotion.minOrderValue) {
                throw new ORPCError("BAD_REQUEST", {
                    message: "Minimum order value not reached",
                });
            }

            if (promotion.type === "FIXED") {
                discount = promotion.value;
            }

            if (promotion.type === "PERCENT") {
                discount = (input.subtotal * promotion.value) / 100;

                if (promotion.maxDiscountValue !== null) {
                    discount = Math.min(discount, promotion.maxDiscountValue);
                }
            }

            discount = Math.min(discount, input.subtotal);

            return {
                discount,
                couponId: coupon.id,
            };
        }),
    getCategory: base.input(z.object({ storeId: z.string().min(1), categoryId: z.string().min(1) })).handler(async ({ input }) => {
        const now = new Date();

        const [category, products] = await Promise.all([
            prisma.category.findUnique({
                where: {
                    id: input.categoryId,
                    storeId: input.storeId,
                },
                include: {
                    billboard: true,
                    children: {
                        include: {
                            _count: {
                                select: { products: true },
                            },
                        },
                    },
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
            }),
            prisma.product.findMany({
                where: {
                    storeId: input.storeId,
                    category: {
                        parentId: input.categoryId,
                    },
                    status: "PUBLISHED",
                },
                select: {
                    searchableAttributes: true,
                },
            }),
        ]);

        if (!category) {
            throw new ORPCError("NOT_FOUND");
        }

        return {
            ...category,
            products,
        };
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

            return await prisma.$transaction(async (tx) => {
                const product = await tx.product.findUniqueOrThrow({
                    where: { id: input.productId },
                    select: {
                        reviewCount: true,
                        ratingSum: true,
                    },
                });
                const newReviewCount = product.reviewCount + 1;
                const newRatingSum = product.ratingSum + input.rating;

                const reviewCreated = await tx.review.create({
                    data: {
                        storeId: input.storeId,
                        productId: input.productId,
                        userId: context.user.id,
                        rating: input.rating,
                        feedback: input.feedback,
                    },
                });

                if (reviewCreated) {
                    await tx.product.update({
                        where: {
                            id: input.productId,
                        },
                        data: {
                            reviewCount: newReviewCount,
                            ratingSum: newRatingSum,
                            averageRating: newRatingSum / newReviewCount,
                        },
                    });
                }

                return reviewCreated;
            });
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

            return await prisma.$transaction(async (tx) => {
                const product = await tx.product.findUniqueOrThrow({
                    where: { id: input.productId },
                    select: {
                        reviewCount: true,
                        ratingSum: true,
                    },
                });

                const newRatingSum = product.ratingSum - existingReview.rating + input.rating;

                const reviewUpdated = await tx.review.update({
                    where: {
                        id: existingReview.id,
                    },
                    data: {
                        rating: input.rating,
                        feedback: input.feedback,
                    },
                });

                if (reviewUpdated) {
                    await tx.product.update({
                        where: {
                            id: input.productId,
                        },
                        data: {
                            ratingSum: newRatingSum,
                            averageRating: newRatingSum / product.reviewCount,
                        },
                    });
                }

                return reviewUpdated;
            });
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
    getReviews: base
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
                rating: z.literal(reviewsFilter),
                cursor: z
                    .object({
                        id: z.string(),
                        createdAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(MIN_LIMIT).max(MAX_LIMIT),
            }),
        )
        .handler(async ({ input }) => {
            const { storeId, productId, rating, cursor, limit } = input;
            const data = await prisma.review.findMany({
                where: {
                    storeId,
                    productId,
                    rating: rating !== "all" ? Number(rating) : undefined,
                    ...(cursor
                        ? {
                              OR: [
                                  { createdAt: { lt: cursor.createdAt } },
                                  {
                                      AND: [{ createdAt: cursor.createdAt }, { id: { lt: cursor.id } }],
                                  },
                              ],
                          }
                        : {}),
                },
                include: {
                    user: { select: { email: true, name: true, image: true } },
                    _count: {
                        select: { reports: true, reactions: true },
                    },
                    reports: {
                        select: {
                            userId: true,
                        },
                    },
                    reactions: {
                        select: {
                            userId: true,
                            type: true,
                            id: true,
                        },
                    },
                },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                take: limit + 1,
            });

            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore
                ? {
                      id: lastItem.id,
                      createdAt: lastItem.createdAt,
                  }
                : null;

            return {
                items,
                nextCursor,
            };
        }),
    addFavorite: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const ownerProduct = await prisma.product.findUnique({
                where: {
                    id: input.productId,
                    storeId: input.storeId,
                },
            });

            if (!ownerProduct) {
                throw new ORPCError("NOT_FOUND");
            }

            const existingFavorite = await prisma.favorite.findUnique({
                where: {
                    userId_productId: {
                        userId: context.user.id,
                        productId: input.productId,
                    },
                },
            });

            if (existingFavorite) {
                throw new ORPCError("CONFLICT");
            }

            return await prisma.$transaction(async (tx) => {
                const addedFavorite = await tx.favorite.create({
                    data: {
                        userId: context.user.id,
                        productId: input.productId,
                    },
                });

                if (addedFavorite) {
                    await tx.product.update({
                        where: {
                            id: input.productId,
                        },
                        data: {
                            favoriteCount: {
                                increment: 1,
                            },
                        },
                    });
                }

                return addedFavorite;
            });
        }),
    removeFavorite: authed
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const ownerProduct = await prisma.product.findUnique({
                where: {
                    id: input.productId,
                    storeId: input.storeId,
                },
            });

            if (!ownerProduct) {
                throw new ORPCError("NOT_FOUND");
            }

            const existingFavorite = await prisma.favorite.findUnique({
                where: {
                    userId_productId: {
                        userId: context.user.id,
                        productId: input.productId,
                    },
                },
            });

            if (!existingFavorite) {
                throw new ORPCError("NOT_FOUND");
            }

            return await prisma.$transaction(async (tx) => {
                const removedFavorite = await tx.favorite.delete({
                    where: {
                        userId_productId: {
                            userId: context.user.id,
                            productId: input.productId,
                        },
                    },
                });

                if (removedFavorite) {
                    await tx.product.update({
                        where: {
                            id: input.productId,
                        },
                        data: {
                            favoriteCount: {
                                decrement: 1,
                            },
                        },
                    });
                }

                return removedFavorite;
            });
        }),
    createReport: authed
        .input(
            z.object({
                reviewId: z.string().min(1),
                type: z.enum(ReviewReportReason),
                reason: z.string().min(3).max(100).nullable(),
            }),
        )
        .handler(async ({ input, context }) => {
            const existingReport = await prisma.reviewReport.findUnique({
                where: {
                    reviewId_userId: {
                        reviewId: input.reviewId,
                        userId: context.user.id,
                    },
                },
            });

            if (existingReport) {
                throw new ORPCError("CONFLICT");
            }
            return await prisma.$transaction(async (tx) => {
                const reportCreated = await prisma.reviewReport.create({
                    data: {
                        userId: context.user.id,
                        reviewId: input.reviewId,
                        type: input.type,
                        reason: input.reason,
                    },
                });

                if (reportCreated) {
                    const reviewUpdated = await prisma.review.update({
                        where: {
                            id: input.reviewId,
                        },
                        data: {
                            reportCount: {
                                increment: 1,
                            },
                        },
                    });

                    if (reviewUpdated.reportCount > REPORT_BREAKPOINT) {
                        await prisma.review.update({
                            where: {
                                id: input.reviewId,
                            },
                            data: {
                                isHidden: true,
                            },
                        });
                    }
                }

                return reportCreated;
            });
        }),
    getPromotionCampaigns: base
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const now = new Date();

            const promotionCampaigns = await prisma.promotion.findMany({
                where: {
                    storeId: input.storeId,
                    mode: "CATEGORY_CAMPAIGN",
                    isActive: true,
                    startAt: { lte: now },
                    endAt: { gte: now },
                },
                orderBy: [{ priority: "desc" }, { value: "desc" }],
                include: {
                    categories: {
                        select: { slug: true },
                        take: 1,
                    },
                },
            });

            return promotionCampaigns;
        }),
    like: authed
        .input(
            z.object({
                reviewId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const existingReviewReactionLike = await prisma.reviewReaction.findFirst({
                where: {
                    userId: context.user.id,
                    reviewId: input.reviewId,
                    type: "LIKE",
                },
            });

            if (existingReviewReactionLike) {
                const deletedReviewReaction = await prisma.reviewReaction.delete({
                    where: {
                        userId_reviewId: {
                            userId: context.user.id,
                            reviewId: input.reviewId,
                        },
                    },
                });

                return deletedReviewReaction;
            }

            const createdReviewReactionLike = await prisma.reviewReaction.upsert({
                where: {
                    userId_reviewId: {
                        userId: context.user.id,
                        reviewId: input.reviewId,
                    },
                },
                update: {
                    type: "LIKE",
                },
                create: {
                    userId: context.user.id,
                    reviewId: input.reviewId,
                    type: "LIKE",
                },
            });

            return createdReviewReactionLike;
        }),
    dislike: authed
        .input(
            z.object({
                reviewId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const existingReviewReactionDislike = await prisma.reviewReaction.findFirst({
                where: {
                    userId: context.user.id,
                    reviewId: input.reviewId,
                    type: "DISLIKE",
                },
            });

            if (existingReviewReactionDislike) {
                const deletedReviewReaction = await prisma.reviewReaction.delete({
                    where: {
                        userId_reviewId: {
                            userId: context.user.id,
                            reviewId: input.reviewId,
                        },
                    },
                });

                return deletedReviewReaction;
            }

            const createdReviewReactionDislike = await prisma.reviewReaction.upsert({
                where: {
                    userId_reviewId: {
                        userId: context.user.id,
                        reviewId: input.reviewId,
                    },
                },
                update: {
                    type: "DISLIKE",
                },
                create: {
                    userId: context.user.id,
                    reviewId: input.reviewId,
                    type: "DISLIKE",
                },
            });

            return createdReviewReactionDislike;
        }),
    subscribeNewsletter: base
        .input(
            z.object({
                email: z.email(),
            }),
        )
        .handler(async ({ input }) => {
            const htmlEmailSubscribe = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #28a745;">
                    <h2 style="color: #28a745;">Đăng ký thành công!</h2>
                    <p>Chúc mừng bạn! Email <strong>${input.email}</strong> đã đăng lý để nhận thông tin mới nhất.</p>
                    <p>Bạn sẽ sớm nhận được các thông báo chính thức từ phía chúng tôi.</p>
                </div>
            `;
            const infoSendMail = await sendEmail({
                email: input.email,
                subject: "Subscribe to our newsletter",
                replyTo: env.MAIL_FROM_ADDRESS,
                html: htmlEmailSubscribe,
            });

            return infoSendMail;
        }),
    contact: base
        .input(
            z.object({
                firstName: z.string().min(1).max(30),
                lastName: z.string().min(1).max(30),
                email: z.email(),
                subject: z.string().min(1).max(50),
                message: z.string().min(3).max(1000),
            }),
        )
        .handler(async ({ input }) => {
            const { firstName, lastName, email, subject, message } = input;
            const htmlEmailContact = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #17a2b8;">
                    <h2 style="color: #17a2b8;">Vấn đề: ${subject}</h2>
                    <p>Bạn nhận được yêu cầu hỗ trợ từ khách hàng <strong>${firstName} ${lastName}</strong>.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Nội dung:</strong> ${message}</p>
                    </div>
                </div>
            `;
            const infoSendMail = await sendEmail({
                from: email,
                email: env.MAIL_USERNAME,
                subject: subject,
                replyTo: email,
                html: htmlEmailContact,
            });

            return infoSendMail;
        }),
});
