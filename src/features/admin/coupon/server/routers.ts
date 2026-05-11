import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import { insertCouponSchema } from "../schemas";

export const couponsRouter = base.router({
    create: admin.input(insertCouponSchema).handler(async ({ input }) => {
        const { storeId, promotionId, code, usageLimit, perUserLimit } = input;

        const existingCoupon = await prisma.coupon.findUnique({
            where: {
                code: input.code,
            },
        });

        if (existingCoupon) {
            throw new ORPCError("CONFLICT", { message: "This coupon code already exists, please choose a different name." });
        }

        const couponCreated = await prisma.coupon.create({
            data: {
                storeId,
                promotionId,
                code,
                usageLimit,
                perUserLimit,
            },
        });

        return couponCreated;
    }),
    update: admin
        .input(
            insertCouponSchema.extend({
                id: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const { id, storeId, promotionId, code, usageLimit, perUserLimit } = input;

            const coupon = await prisma.coupon.findUnique({
                where: {
                    id,
                    storeId,
                },
            });

            if (!coupon) {
                throw new ORPCError("NOT_FOUND");
            }

            const couponUpdated = await prisma.coupon.update({
                where: {
                    id: id,
                },
                data: {
                    promotionId,
                    code,
                    usageLimit,
                    perUserLimit,
                },
            });

            return couponUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const coupon = await prisma.coupon.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!coupon) {
                throw new ORPCError("NOT_FOUND");
            }

            const couponDeleted = await prisma.coupon.delete({
                where: { id: input.id },
            });

            return couponDeleted;
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const coupon = await prisma.coupon.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            return coupon;
        }),
    getMany: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const coupons = await prisma.coupon.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                promotion: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return coupons;
    }),
});
