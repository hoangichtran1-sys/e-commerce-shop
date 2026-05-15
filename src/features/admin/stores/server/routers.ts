import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import slug from "slug";

export const storesRouter = base.router({
    create: admin
        .input(
            z.object({
                name: z.string(),
            }),
        )
        .handler(async ({ input, context }) => {
            const existingStore = await prisma.store.findFirst({
                where: {
                    slug: slug(input.name),
                    userId: context.user.id,
                },
            });

            if (existingStore) {
                throw new ORPCError("CONFLICT");
            }

            const storeCreated = await prisma.store.create({
                data: {
                    name: input.name,
                    userId: context.user.id,
                    slug: slug(input.name),
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
            orderBy: {
                createdAt: "desc",
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
                    slug: slug(input.name),
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
