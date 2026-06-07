/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@/generated/prisma/client";
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
import { setDate, startOfMonth, subMonths } from "date-fns";

export const customerRouter = base.router({
    getOrdersHistory: authed
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const orders = await prisma.order.findMany({
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
            });

            return orders.map((order) => ({
                ...order,
                amountPaid: order.amountPaid?.toNumber(),
                orderItems: order.orderItems.map((item) => ({
                    ...item,
                    originalPrice: item.originalPrice.toNumber(),
                    finalPrice: item.finalPrice.toNumber(),
                })),
            }));
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
    getStores: base.handler(async () => {
        const stores = await prisma.store.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return stores;
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
                    _count: {
                        select: { reviews: true },
                    },
                    reviews: {
                        select: { rating: true },
                    },
                    minPrice: true,
                    maxPrice: true,
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
            }),
        )
        .handler(async ({ input }) => {
            const { storeId, categoryId, colors, sizes, minPrice, maxPrice, search, sort, subcategorySlugs, isFeatured, features } = input;
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
            //const featuresConditions: any[] = [];

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
                        select: { variants: true, reviews: true, favorites: true },
                    },
                    reviews: {
                        select: {
                            rating: true,
                        },
                    },
                },
                orderBy: sortMap[sort],
            });

            return products.map((product) => ({
                ...product,
                minPrice: product.minPrice.toNumber(),
                maxPrice: product.maxPrice.toNumber(),
            }));
        }),
    checkTrending: base.input(z.object({ storeId: z.string().min(1), productId: z.string().min(1) })).handler(async ({ input }) => {
        const now = new Date();

        const currentStart = startOfMonth(now);
        const currentEnd = now;

        const previousStart = startOfMonth(subMonths(now, 1));
        const dayOfMonth = now.getDate();
        const previousEnd = setDate(startOfMonth(subMonths(now, 1)), dayOfMonth);

        const [thisMonthData, lastMonthData, thisTotalMonthQuantity] = await Promise.all([
            prisma.orderItem.aggregate({
                where: {
                    productVariant: {
                        product: {
                            id: input.productId,
                        },
                    },
                    order: {
                        status: {
                            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                        createdAt: {
                            gte: currentStart,
                            lte: currentEnd,
                        },
                    },
                },
                _sum: {
                    quantity: true,
                },
            }),
            prisma.orderItem.aggregate({
                where: {
                    productVariant: {
                        product: {
                            id: input.productId,
                        },
                    },
                    order: {
                        status: {
                            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                        createdAt: {
                            gte: previousStart,
                            lte: previousEnd,
                        },
                    },
                },
                _sum: {
                    quantity: true,
                },
            }),
            prisma.orderItem.aggregate({
                where: {
                    order: {
                        storeId: input.storeId,
                        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
                        createdAt: { gte: currentStart, lte: currentEnd },
                    },
                },
                _sum: { quantity: true },
            }),
        ]);

        const thisMonthQty = thisMonthData._sum.quantity || 0;
        const lastMonthQty = lastMonthData._sum.quantity || 0;

        const growthRate = (thisMonthQty - lastMonthQty) / Math.max(lastMonthQty, 1);

        const score = growthRate * Math.log10(thisMonthQty + 1);

        return {
            score,
            growthRate,
            totalQuantity: thisTotalMonthQuantity._sum.quantity || 0,
            thisMonthQty,
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
                reviews: {
                    select: {
                        rating: true,
                    },
                },
                favorites: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        reviews: true,
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
    getReviews: base
        .input(
            z.object({
                storeId: z.string().min(1),
                productId: z.string().min(1),
                rating: z.literal(reviewsFilter),
            }),
        )
        .handler(async ({ input }) => {
            const reviews = await prisma.review.findMany({
                where: {
                    storeId: input.storeId,
                    productId: input.productId,
                    rating: input.rating !== "all" ? Number(input.rating) : undefined,
                },
                include: { user: { select: { email: true, name: true, image: true } } },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return reviews;
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

            const addedFavorite = await prisma.favorite.create({
                data: {
                    userId: context.user.id,
                    productId: input.productId,
                },
            });

            return addedFavorite;
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

            const removedFavorite = await prisma.favorite.delete({
                where: {
                    userId_productId: {
                        userId: context.user.id,
                        productId: input.productId,
                    },
                },
            });

            return removedFavorite;
        }),
});
