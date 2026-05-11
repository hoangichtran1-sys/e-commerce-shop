import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { z } from "zod";

export const ordersRouter = base.router({
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const order = await prisma.order.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
                include: {
                    orderItems: {
                        select: {
                            product: {
                                select: {
                                    name: true,
                                    price: true,
                                    id: true,
                                },
                            },
                            id: true,
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
                    product: {
                        ...item.product,
                        price: item.product.price.toNumber(),
                    },
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
                            product: {
                                select: {
                                    name: true,
                                    price: true,
                                    id: true,
                                },
                            },
                            id: true,
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
                    product: {
                        ...item.product,
                        price: item.product.price.toNumber(),
                    },
                })),
            };
        }),
    getMany: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const orders = await prisma.order.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                orderItems: {
                    select: {
                        product: {
                            select: {
                                name: true,
                                price: true,
                                id: true,
                            },
                        },
                        id: true,
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
        });

        return orders.map((order) => ({
            ...order,
            amountPaid: order.amountPaid ? order.amountPaid.toNumber() : null,
            orderItems: order.orderItems.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    price: item.product.price.toNumber(),
                },
            })),
        }));
    }),
});
