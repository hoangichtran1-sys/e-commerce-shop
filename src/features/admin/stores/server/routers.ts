import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const storesRouter = base.router({
    create: admin
        .route({
            method: "POST",
            path: "/stores",
            summary: "Create new store",
            tags: ["stores"],
        })
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
        .route({
            method: "GET",
            path: "/stores/{id}",
            summary: "Get store by ID",
            tags: ["stores"],
        })
        .input(
            z.object({
                id: z.string().uuid(),
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
});
