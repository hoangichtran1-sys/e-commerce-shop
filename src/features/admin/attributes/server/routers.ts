import { AttributeType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const attributesRouter = base.router({
    create: admin
        .input(
            z.object({
                name: z.string().min(1),
                storeId: z.string().min(1),
                values: z.array(z.string()).min(1),
                type: z.enum(AttributeType),
            }),
        )
        .handler(async ({ input }) => {
            const attributeCreated = await prisma.attribute.create({
                data: {
                    name: input.name,
                    storeId: input.storeId,
                    type: input.type,
                    values: {
                        createMany: {
                            data: input.values.map((val) => ({
                                value: val,
                            })),
                        },
                    },
                },
            });

            return attributeCreated;
        }),
    update: admin
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
                type: z.enum(AttributeType),
                storeId: z.string().min(1),
                values: z.array(z.string()).min(1),
            }),
        )
        .handler(async ({ input }) => {
            const attribute = await prisma.attribute.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!attribute) {
                throw new ORPCError("NOT_FOUND");
            }

            const attributeUpdated = await prisma.attribute.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    type: input.type,
                    values: {
                        deleteMany: {},
                        ...(input.values.length > 0 && {
                            createMany: {
                                data: input.values.map((val) => ({
                                    value: val,
                                })),
                            },
                        }),
                    },
                },
            });

            return attributeUpdated;
        }),
    delete: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const attribute = await prisma.attribute.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
            });

            if (!attribute) {
                throw new ORPCError("NOT_FOUND");
            }

            const attributeDeleted = await prisma.attribute.delete({
                where: {
                    id: input.id,
                },
            });

            return attributeDeleted;
        }),
    getOne: admin
        .input(
            z.object({
                id: z.string().min(1),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const attribute = await prisma.attribute.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
                include: {
                    values: true,
                },
            });

            return attribute;
        }),
    getMany: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const attributes = await prisma.attribute.findMany({
            where: {
                storeId: input.storeId,
            },
            include: {
                values: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return attributes;
    }),
});
