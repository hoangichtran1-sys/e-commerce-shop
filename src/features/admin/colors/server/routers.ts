import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const colorsRouter = base.router({
    create: admin
        .input(
            z.object({
                name: z.string().min(1),
                categoryId: z.string().min(1),
                storeId: z.string().min(1),
                value: z
                    .string()
                    .regex(/^[#][0-9A-Fa-f]{6}$/)
                    .transform((val) => val.toUpperCase()),
            }),
        )
        .handler(async ({ input }) => {
            const colorCreated = await prisma.color.create({
                data: {
                    name: input.name,
                    value: input.value,
                    categoryId: input.categoryId,
                    storeId: input.storeId,
                },
            });

            return colorCreated;
        }),
    update: admin
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
                categoryId: z.string().min(1),
                storeId: z.string().min(1),
                value: z
                    .string()
                    .regex(/^[#][0-9A-Fa-f]{6}$/)
                    .transform((val) => val.toUpperCase()),
            }),
        )
        .handler(async ({ input }) => {
            const color = await prisma.color.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!color) {
                throw new ORPCError("NOT_FOUND");
            }

            const colorUpdated = await prisma.color.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    value: input.value,
                    categoryId: input.categoryId,
                    storeId: input.storeId,
                },
            });

            return colorUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const color = await prisma.color.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!color) {
                throw new ORPCError("NOT_FOUND");
            }

            const colorDeleted = await prisma.category.delete({
                where: {
                    id: input.id,
                },
            });

            return colorDeleted;
        }),
    getOneByID: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const color = await prisma.color.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            return color;
        }),
    getOneByCategoryAndStoreAndValue: admin
        .input(
            z.object({
                categoryId: z.string().min(1),
                storeId: z.string().min(1),
                value: z
                    .string()
                    .regex(/^[#][0-9A-Fa-f]{6}$/)
                    .transform((val) => val.toUpperCase()),
            }),
        )
        .handler(async ({ input }) => {
            const color = await prisma.color.findUnique({
                where: {
                    storeId_categoryId_value: {
                        storeId: input.storeId,
                        categoryId: input.categoryId,
                        value: input.value,
                    },
                },
            });

            return color;
        }),
    getManyByStore: admin
        .input(z.object({ storeId: z.string().min(1) }))
        .handler(async ({ input }) => {
            const colors = await prisma.color.findMany({
                where: {
                    storeId: input.storeId,
                },
                include: {
                    category: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return colors;
        }),
    getManyByStoreAndCategory: admin
        .input(
            z.object({
                storeId: z.string().min(1),
                categoryId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const colors = await prisma.color.findMany({
                where: {
                    storeId: input.storeId,
                    categoryId: input.categoryId,
                },
                include: {
                    category: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return colors;
        }),
});
