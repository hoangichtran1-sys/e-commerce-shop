import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const categoriesRouter = base.router({
    create: admin
        .input(
            z.object({
                name: z.string().min(1),
                billboardId: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const categoryCreated = await prisma.category.create({
                data: {
                    name: input.name,
                    billboardId: input.billboardId,
                    storeId: input.storeId,
                },
            });

            return categoryCreated;
        }),
    update: admin
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
                billboardId: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const category = await prisma.category.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!category) {
                throw new ORPCError("NOT_FOUND");
            }

            const categoryUpdated = await prisma.category.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    billboardId: input.billboardId,
                },
            });

            return categoryUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const category = await prisma.category.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!category) {
                throw new ORPCError("NOT_FOUND");
            }

            const categoryDeleted = await prisma.category.delete({
                where: {
                    id: input.id,
                },
            });

            return categoryDeleted;
        }),
    bulkDelete: admin
        .input(
            z.object({
                ids: z.array(z.string().min(1)),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const storeOwner = await prisma.store.findUnique({
                where: {
                    id: input.storeId,
                    userId: context.user.id,
                },
            });

            if (!storeOwner) {
                throw new ORPCError("UNAUTHORIZED");
            }

            const categoriesDeleted = await prisma.$transaction(
                input.ids.map((id) =>
                    prisma.category.delete({
                        where: { id },
                    }),
                ),
            );

            return {
                count: categoriesDeleted.length,
            };
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const category = await prisma.category.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            return category;
        }),
    getMany: admin
        .input(z.object({ storeId: z.string().min(1) }))
        .handler(async ({ input }) => {
            const categories = await prisma.category.findMany({
                where: {
                    storeId: input.storeId,
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
    getManyWithPromotion: admin
        .input(z.object({ storeId: z.string().min(1) }))
        .handler(async ({ input }) => {
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

            return categories.map((category) => ({
                ...category,
                promotions: category.promotions.map((promotion) => ({
                    ...promotion,
                    minOrderValue: promotion.minOrderValue.toNumber(),
                    maxDiscountValue: promotion.maxDiscountValue
                        ? promotion.maxDiscountValue.toNumber()
                        : null,
                })),
            }));
        }),
});
