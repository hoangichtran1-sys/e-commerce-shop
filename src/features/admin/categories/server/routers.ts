import { generateCategorySlug } from "@/lib/generate-category-slug";
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
                subcategories: z.array(z.string().min(1)),
            }),
        )
        .handler(async ({ input }) => {
            const parenSlug = generateCategorySlug(input.name);
            const existing = await prisma.category.findUnique({
                where: {
                    storeId_slug: {
                        storeId: input.storeId,
                        slug: parenSlug,
                    },
                },
            });

            if (existing) {
                throw new ORPCError("CONFLICT");
            }

            const categoryCreated = await prisma.category.create({
                data: {
                    name: input.name,
                    billboardId: input.billboardId,
                    storeId: input.storeId,
                    slug: parenSlug,
                    children: {
                        createMany: {
                            data: input.subcategories.map((sub) => ({
                                name: sub,
                                storeId: input.storeId,
                                slug: generateCategorySlug(input.name, sub),
                            })),
                        },
                    },
                },
            });

            return categoryCreated;
        }),
    update: admin
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
                billboardId: z.string().min(1).nullable(),
                subcategories: z.array(z.string().min(1)),
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const category = await prisma.category.findUnique({
                where: {
                    id: input.id,
                    storeId: input.storeId,
                },
                include: {
                    children: {
                        include: {
                            _count: {
                                select: { products: true },
                            },
                        },
                    },
                },
            });

            if (!category) {
                throw new ORPCError("NOT_FOUND");
            }

            const categoryUpdated = await prisma.$transaction(async (tx) => {
                const currentChildren = category.children;
                const currentChildrenSlugs = currentChildren.map((child) => child.slug);

                const subcategoriesInputFormat = input.subcategories.map((sub) => ({
                    name: sub,
                    slug: generateCategorySlug(category.name, sub.trim().toLowerCase()),
                }));

                const subcategoriesInputFormatSlugs = input.subcategories.map((sub) => generateCategorySlug(category.name, sub.trim().toLowerCase()));

                const subcategoriesToDelete = currentChildren
                    .filter((child) => !subcategoriesInputFormatSlugs.includes(child.slug) && child._count.products === 0)
                    .map((child) => child.slug);

                const subcategoriesToCreate = subcategoriesInputFormat.filter((sub) => !currentChildrenSlugs.includes(sub.slug));

                if (subcategoriesToDelete.length > 0) {
                    await tx.category.deleteMany({
                        where: {
                            parentId: input.id,
                            slug: {
                                in: subcategoriesToDelete,
                            },
                        },
                    });
                }

                const parenSlug = generateCategorySlug(input.name);

                return await tx.category.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        name: input.name,
                        billboardId: input.billboardId,
                        slug: parenSlug,
                        ...(subcategoriesToCreate.length > 0 && {
                            children: {
                                createMany: {
                                    data: subcategoriesToCreate.map((sub) => ({
                                        name: sub.name,
                                        storeId: input.storeId,
                                        slug: sub.slug,
                                    })),
                                },
                            },
                        }),
                    },
                });
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
                include: {
                    children: {
                        include: {
                            _count: {
                                select: { products: true },
                            },
                        },
                    },
                },
            });

            if (!category) {
                throw new ORPCError("NOT_FOUND");
            }

            const subsWithProducts = category.children.filter((sub) => sub._count.products > 0);

            if (subsWithProducts.length > 0) {
                const invalidNames = subsWithProducts.map((sub) => sub.name).join(", ");

                throw new ORPCError("BAD_REQUEST", {
                    message: `Can't delete subcategories: [${invalidNames}] because they contain the product.`,
                });
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
    disconnect: admin
        .input(
            z.object({
                categoryId: z.string(),
                promotionId: z.string(),
                storeId: z.string(),
            }),
        )
        .handler(async ({ input }) => {
            const category = await prisma.category.findUnique({
                where: { id: input.categoryId, storeId: input.storeId },
            });

            if (!category) {
                throw new ORPCError("NOT_FOUND");
            }

            await prisma.category.update({
                where: { id: input.categoryId },
                data: {
                    promotions: {
                        disconnect: { id: input.promotionId },
                    },
                },
            });

            return {
                message: "Campaign cancelled",
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
                include: {
                    children: {
                        include: {
                            _count: {
                                select: { products: true },
                            },
                        },
                    },
                },
            });

            return category;
        }),
    getManyParent: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const categories = await prisma.category.findMany({
            where: {
                storeId: input.storeId,
                parentId: null,
            },
            include: {
                children: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return categories;
    }),
    getManyWithPromotion: admin.input(z.object({ storeId: z.string().min(1) })).handler(async ({ input }) => {
        const categories = await prisma.category.findMany({
            where: {
                storeId: input.storeId,
                parent: null,
            },
            include: {
                billboard: true,
                promotions: true,
                children: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return categories;
    }),
});
