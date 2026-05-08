import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { insertPromotionSchema } from "../schemas";
import { Prisma } from "@/generated/prisma/client";

export const promotionsRouter = base.router({
    create: admin.input(insertPromotionSchema).handler(async ({ input }) => {
        const {
            name,
            storeId,
            categoryIds,
            type,
            value,
            startAt,
            endAt,
            mode,
            isActive,
            minOrderValue,
            maxDiscountValue,
        } = input;

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
                minOrderValue: Prisma.Decimal(minOrderValue),
                maxDiscountValue: maxDiscountValue
                    ? Prisma.Decimal(maxDiscountValue)
                    : undefined,
                categories: {
                    connect: categoryIds.map((id) => ({ id })),
                },
            },
        });

        return {
            ...promotionCreated,
            minOrderValue: promotionCreated.minOrderValue.toNumber(),
            maxDiscountValue: promotionCreated.maxDiscountValue
                ? promotionCreated.maxDiscountValue.toNumber()
                : null,
        };
    }),
    update: admin
        .input(
            insertPromotionSchema.extend({
                id: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const {
                id,
                name,
                storeId,
                categoryIds,
                type,
                value,
                startAt,
                endAt,
                mode,
                isActive,
                minOrderValue,
                maxDiscountValue,
            } = input;

            const promotion = await prisma.promotion.findUnique({
                where: {
                    id,
                    storeId,
                },
            });

            if (!promotion) {
                throw new ORPCError("NOT_FOUND");
            }

            const promotionUpdated = await prisma.promotion.update({
                where: {
                    id: input.id,
                },
                data: {
                    name,
                    storeId,
                    type,
                    value,
                    startAt,
                    endAt,
                    mode,
                    isActive,
                    minOrderValue: Prisma.Decimal(minOrderValue),
                    maxDiscountValue: maxDiscountValue
                        ? Prisma.Decimal(maxDiscountValue)
                        : undefined,
                    categories: {
                        set: categoryIds.map((id) => ({ id })),
                    },
                },
            });

            return {
                ...promotionUpdated,
                minOrderValue: promotionUpdated.minOrderValue.toNumber(),
                maxDiscountValue: promotionUpdated.maxDiscountValue
                    ? promotionUpdated.maxDiscountValue.toNumber()
                    : null,
            };
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

            return {
                ...promotionDeleted,
                minOrderValue: promotionDeleted.minOrderValue.toNumber(),
                maxDiscountValue: promotionDeleted.maxDiscountValue
                    ? promotionDeleted.maxDiscountValue.toNumber()
                    : null,
            };
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
                    coupons: true,
                },
            });

            if (!promotion) {
                return null;
            }

            return {
                ...promotion,
                minOrderValue: promotion.minOrderValue.toNumber(),
                maxDiscountValue: promotion.maxDiscountValue
                    ? promotion.maxDiscountValue.toNumber()
                    : null,
            };
        }),
    getManyByStore: admin
        .input(z.object({ storeId: z.string().min(1) }))
        .handler(async ({ input }) => {
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

            return promotions.map((promotion) => ({
                ...promotion,
                minOrderValue: promotion.minOrderValue.toNumber(),
                maxDiscountValue: promotion.maxDiscountValue
                    ? promotion.maxDiscountValue.toNumber()
                    : null,
            }));
        }),
    getManyWithCouponMode: admin
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const promotionsCoupon = await prisma.promotion.findMany({
                where: {
                    storeId: input.storeId,
                    mode: "COUPON",
                },
            });

            return promotionsCoupon.map((promotion) => ({
                ...promotion,
                minOrderValue: promotion.minOrderValue.toNumber(),
                maxDiscountValue: promotion.maxDiscountValue
                    ? promotion.maxDiscountValue.toNumber()
                    : null,
            }));
        }),
});
