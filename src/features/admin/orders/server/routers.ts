import { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const ordersRouter = base.router({
    getOne: admin
        .input(
            z.object({
                orderCode: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const order = await prisma.order.findUnique({
                where: {
                    storeId_orderCode: {
                        orderCode: input.orderCode,
                        storeId: input.storeId,
                    },
                },
                include: {
                    orderItems: {
                        select: {
                            productVariant: {
                                select: {
                                    id: true,
                                    sku: true,
                                    combination: true,
                                    product: {
                                        select: { name: true, images: { select: { url: true } } },
                                    },
                                },
                            },
                            id: true,
                            quantity: true,
                            originalPrice: true,
                            finalPrice: true,
                        },
                    },
                    coupon: {
                        select: {
                            code: true,
                            promotion: {
                                select: { value: true, type: true },
                            },
                        },
                    },
                },
            });

            if (!order) {
                return null;
            }

            return {
                ...order,
                amountPaid: order.amountPaid ? order.amountPaid.toNumber() : null,
                orderItems: order.orderItems.map((item) => ({
                    ...item,
                    originalPrice: item.originalPrice.toNumber(),
                    finalPrice: item.finalPrice.toNumber(),
                })),
            };
        }),
    getOneByTransaction: admin
        .input(
            z.object({
                transactionId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const order = await prisma.order.findUnique({
                where: {
                    transactionId: input.transactionId,
                },
                include: {
                    orderItems: {
                        select: {
                            productVariant: {
                                select: {
                                    id: true,
                                    sku: true,
                                    combination: true,
                                    product: {
                                        select: { name: true, images: { select: { url: true } } },
                                    },
                                },
                            },
                            id: true,
                            quantity: true,
                            originalPrice: true,
                            finalPrice: true,
                        },
                    },
                    coupon: {
                        select: {
                            code: true,
                            promotion: {
                                select: { value: true, type: true },
                            },
                        },
                    },
                },
            });

            if (!order) {
                return null;
            }

            return {
                ...order,
                amountPaid: order.amountPaid ? order.amountPaid.toNumber() : null,
                orderItems: order.orderItems.map((item) => ({
                    ...item,
                    originalPrice: item.originalPrice.toNumber(),
                    finalPrice: item.finalPrice.toNumber(),
                })),
            };
        }),
    getMany: admin.input(z.object({ storeId: z.string().min(1), limit: z.number().int().optional() })).handler(async ({ input }) => {
        const orders = await prisma.order.findMany({
            where: {
                storeId: input.storeId,
                status: input.limit ? { not: "PENDING" } : undefined,
            },
            include: {
                orderItems: {
                    select: {
                        productVariant: {
                            select: {
                                id: true,
                                sku: true,
                                combination: true,
                                product: {
                                    select: { name: true, images: { select: { url: true }, take: 1 } },
                                },
                            },
                        },
                        id: true,
                        quantity: true,
                        originalPrice: true,
                        finalPrice: true,
                    },
                },
                coupon: {
                    select: {
                        code: true,
                        promotion: {
                            select: { value: true, type: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: input.limit ? input.limit : undefined,
        });

        return orders.map((order) => ({
            ...order,
            amountPaid: order.amountPaid ? order.amountPaid.toNumber() : null,
            orderItems: order.orderItems.map((item) => ({
                ...item,
                originalPrice: item.originalPrice.toNumber(),
                finalPrice: item.finalPrice.toNumber(),
            })),
        }));
    }),
    switchStatus: admin
        .input(
            z.object({
                orderId: z.string().min(1),
                status: z.enum(OrderStatus),
            }),
        )
        .handler(async ({ input }) => {
            const order = await prisma.order.findUnique({
                where: {
                    id: input.orderId,
                },
            });

            if (!order) {
                throw new ORPCError("NOT_FOUND");
            }

            const orderUpdated = await prisma.order.update({
                where: {
                    id: input.orderId,
                },
                data: {
                    status: input.status,
                },
                include: {
                    orderItems: {
                        include: {
                            productVariant: true,
                        },
                    },
                },
            });

            if (orderUpdated.status === "CANCELLED") {
                if (orderUpdated.couponId) {
                    await prisma.coupon.update({
                        where: {
                            id: orderUpdated.couponId,
                        },
                        data: {
                            usedCount: {
                                decrement: 1,
                            },
                        },
                    });
                }

                const productVariantItems = orderUpdated.orderItems.map((item) => ({
                    variantId: item.productVariantId,
                    quantity: item.quantity,
                    productId: item.productVariant.productId,
                }));

                const soldMap = new Map<string, number>();

                for (const item of productVariantItems) {
                    await prisma.productVariant.update({
                        where: {
                            id: item.variantId,
                        },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });

                    soldMap.set(item.productId, (soldMap.get(item.productId) || 0) + item.quantity);
                }

                for (const [productId, quantity] of soldMap) {
                    await prisma.product.update({
                        where: {
                            id: productId,
                        },
                        data: {
                            soldCount: {
                                decrement: quantity,
                            },
                        },
                    });
                }
            }

            return orderUpdated;
        }),
    refund: admin
        .input(
            z.object({
                orderId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const order = await prisma.order.findUnique({
                where: {
                    id: input.orderId,
                },
            });

            if (!order) {
                throw new ORPCError("NOT_FOUND");
            }

            let message = "";

            if (order.transactionId && order.status !== "REFUND") {
                await stripe.refunds.create({
                    payment_intent: order.transactionId,
                });
                message = "Refund created";
            } else {
                message = "Refund not created";
            }

            return {
                ...order,
                message,
            };
        }),
});
