import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
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
                },
            });

            if (!order) {
                throw new ORPCError("NOT_FOUND");
            }

            return {
                ...order,
                orderItems: order.orderItems.map((item) => ({
                    ...item,
                    product: {
                        ...item.product,
                        price: item.product.price.toNumber(),
                    },
                })),
            };
        }),
    getMany: admin
        .input(z.object({ storeId: z.string().min(1) }))
        .handler(async ({ input }) => {
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
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return orders.map((order) => ({
                ...order,
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
