import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { insertPromotionSchema } from "../schemas";

export const promotionsRouter = base.router({
    create: admin.input(insertPromotionSchema).handler(async ({ input }) => {
        const { name, storeId, categoryIds, type, value, startAt, endAt, mode, isActive, minOrderValue, maxDiscountValue, priority } = input;

        const promotionCreated = await prisma.promotion.create({
            data: {
                name,
                storeId,
                type,
                value,
                startAt,
                endAt,
                mode,
                isActive,
                minOrderValue,
                maxDiscountValue,
                priority,
                categories: {
                    connect: categoryIds.map((id) => ({ id })),
                },
            },
        });

        return promotionCreated;
    }),
    update: admin
        .input(
            insertPromotionSchema.extend({
                id: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const { id, name, storeId, categoryIds, type, value, startAt, endAt, mode, isActive, minOrderValue, maxDiscountValue, priority } = input;

            const promotion = await prisma.promotion.findUnique({
                where: {
                    id,
                    storeId,
                },
                include: {
                    _count: {
                        select: {
                            coupons: true,
                            categories: true,
                        },
                    },
                },
            });

            if (!promotion) {
                throw new ORPCError("NOT_FOUND");
            }

            if (mode === "CATEGORY_CAMPAIGN") {
                if (promotion._count.coupons > 0) {
                    throw new ORPCError("BAD_REQUEST", { message: "Update mode failed because relation with coupon" });
                }
            }

            if (mode === "COUPON") {
                if (promotion._count.categories > 0) {
                    throw new ORPCError("BAD_REQUEST", { message: "Update mode failed because relation with category" });
                }
            }

            const promotionUpdated = await prisma.promotion.update({
                where: {
                    id: input.id,
                },
                data: {
                    name,
                    type,
                    value,
                    startAt,
                    endAt,
                    mode,
                    isActive,
                    minOrderValue,
                    maxDiscountValue,
                    priority,
                    categories: {
                        set: categoryIds.map((id) => ({ id })),
                    },
                },
            });

            return promotionUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const promotion = await prisma.promotion.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!promotion) {
                throw new ORPCError("NOT_FOUND");
            }

            const promotionDeleted = await prisma.promotion.delete({
                where: {
                    id: input.id,
                },
            });

            return promotionDeleted;
        }),
    toggleActive: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const promotion = await prisma.promotion.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });
            if (!promotion) {
                throw new ORPCError("NOT_FOUND");
            }

            const toggleActivePromotion = await prisma.promotion.update({
                where: { id: input.id },
                data: {
                    isActive: !promotion.isActive,
                },
            });

            return toggleActivePromotion;
        }),
    priorityChange: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
                priority: z.number().int().min(0).max(100),
            }),
        )
        .handler(async ({ input }) => {
            const promotion = await prisma.promotion.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });
            if (!promotion) {
                throw new ORPCError("NOT_FOUND");
            }

            const priorityChangePromotion = await prisma.promotion.update({
                where: { id: input.id },
                data: {
                    priority: input.priority,
                },
            });

            return priorityChangePromotion;
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const promotion = await prisma.promotion.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
                include: {
                    categories: true,
                    _count: {
                        select: {
                            coupons: true,
                            categories: true,
                        },
                    },
                },
            });

            if (!promotion) {
                return null;
            }

            return promotion;
        }),
    getManyByStore: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const promotions = await prisma.promotion.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                categories: true,
                coupons: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return promotions;
    }),
    getManyWithCouponMode: admin
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const promotionsWithCoupon = await prisma.promotion.findMany({
                where: {
                    storeId: input.storeId,
                    mode: "COUPON",
                },
            });

            return promotionsWithCoupon;
        }),
});
