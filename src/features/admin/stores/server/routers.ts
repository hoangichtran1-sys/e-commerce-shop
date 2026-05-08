import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const storesRouter = base.router({
    create: admin
        .input(
            z.object({
                name: z.string(),
            }),
        )
        .handler(async ({ input, context }) => {
            const storeCreated = await prisma.store.create({
                data: {
                    name: input.name,
                    userId: context.user.id,
                },
            });

            return storeCreated;
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const store = await prisma.store.findUnique({
                where: {
                    id: input.id,
                    userId: context.user.id,
                },
            });

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            return store;
        }),
    getMany: admin.handler(async ({ context }) => {
        const stores = await prisma.store.findMany({
            where: {
                userId: context.user.id,
            },
        });

        return stores;
    }),
    update: admin
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
                description: z.string().nullable(),
            }),
        )
        .handler(async ({ input, context }) => {
            const store = await prisma.store.findUnique({
                where: {
                    id: input.id,
                    userId: context.user.id,
                },
            });

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            const storeUpdated = await prisma.store.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    description: input.description,
                },
            });

            return storeUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
            }),
        )
        .handler(async ({ input, context }) => {
            const store = await prisma.store.findUnique({
                where: {
                    id: input.id,
                    userId: context.user.id,
                },
            });

            if (!store) {
                throw new ORPCError("NOT_FOUND");
            }

            const storeDeleted = await prisma.store.delete({
                where: {
                    id: input.id,
                },
            });

            return storeDeleted;
        }),
});
