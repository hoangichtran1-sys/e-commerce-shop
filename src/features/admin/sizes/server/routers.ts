import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const sizesRouter = base.router({
    create: admin
        .input(
            z.object({
                name: z.string().min(1),
                categoryId: z.string().min(1),
                storeId: z.string().min(1),
                value: z
                    .string()
                    .min(1)
                    .max(10)
                    .regex(/^[a-zA-Z0-9\s]+$/)
                    .transform((val) => val.toUpperCase()),
            }),
        )
        .handler(async ({ input }) => {
            const sizeCreated = await prisma.size.create({
                data: {
                    name: input.name,
                    value: input.value,
                    categoryId: input.categoryId,
                    storeId: input.storeId,
                },
            });

            return sizeCreated;
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
                    .min(1)
                    .max(10)
                    .regex(/^[a-zA-Z0-9\s]+$/)
                    .transform((val) => val.toUpperCase()),
            }),
        )
        .handler(async ({ input }) => {
            const size = await prisma.size.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!size) {
                throw new ORPCError("NOT_FOUND");
            }

            const sizeUpdated = await prisma.size.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    value: input.value,
                    categoryId: input.categoryId,
                },
            });

            return sizeUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const size = await prisma.size.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!size) {
                throw new ORPCError("NOT_FOUND");
            }

            const sizeDeleted = await prisma.size.delete({
                where: {
                    id: input.id,
                },
            });

            return sizeDeleted;
        }),
    getOneByID: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const size = await prisma.size.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            return size;
        }),
    getOneByCategoryAndStoreAndValue: admin
        .input(
            z.object({
                categoryId: z.string().min(1),
                storeId: z.string().min(1),
                value: z
                    .string()
                    .min(1)
                    .max(10)
                    .regex(/^[a-zA-Z0-9\s]+$/)
                    .transform((val) => val.toUpperCase()),
            }),
        )
        .handler(async ({ input }) => {
            const size = await prisma.size.findUnique({
                where: {
                    storeId_categoryId_value: {
                        storeId: input.storeId,
                        categoryId: input.categoryId,
                        value: input.value,
                    },
                },
            });

            return size;
        }),
    getManyByStore: admin
        .input(z.object({ storeId: z.string().min(1) }))
        .handler(async ({ input }) => {
            const sizes = await prisma.size.findMany({
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

            return sizes;
        }),
    getManyByStoreAndCategory: admin
        .input(
            z.object({
                storeId: z.string().min(1),
                categoryId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const sizes = await prisma.size.findMany({
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

            return sizes;
        }),
});
