import { prisma } from "@/lib/prisma";
import { base, admin } from "@/orpc/init";
import { ORPCError } from "@orpc/client";
import { z } from "zod";
import slug from "slug";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { format, startOfMonth, subMonths } from "date-fns";
import { DiscountSnapshot } from "@/features/customer/types";
import { LOW_STOCK } from "@/constants";
import { calculatePercentageChange } from "@/lib/utils";

const groupSalesByMonth = (orders: { createdAt: Date; discountSnapshot: DiscountSnapshot }[]) => {
    const salesMap: Record<string, number> = {};
    orders.forEach((order) => {
        const monthLabel = format(new Date(order.createdAt), "MMM, yyyy");
        salesMap[monthLabel] = (salesMap[monthLabel] || 0) + order.discountSnapshot.subtotal + order.discountSnapshot.savings;
    });
    return salesMap;
};

export const storesRouter = base.router({
    upload: admin
        .input(
            z.object({
                file: z
                    .instanceof(File)
                    .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size 5MB")
                    .refine((file) => file.type.startsWith("image/"), "Type image is required"),
            }),
        )
        .handler(async ({ input }) => {
            const { file } = input;

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream({ folder: "stores" }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                        if (error) reject(error);
                        if (!result) return reject(new ORPCError("BAD_REQUEST"));
                        resolve(result);
                    })
                    .end(buffer);
            });

            const newUpload = await prisma.upload.create({
                data: {
                    publicId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    mimetype: file.type,
                    size: file.size,
                    isLinked: false,
                    refType: "STORE",
                },
            });

            return {
                url: newUpload.url,
                id: newUpload.id,
            };
        }),
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
            throw new ORPCError("NOT_FOUND");
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
                thumbnailUrl: z.string().min(1).nullable(),
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

            const isThumbnailChanged = input.thumbnailUrl && store.thumbnail && input.thumbnailUrl !== store.thumbnail;

            const storeUpdated = await prisma.store.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    description: input.description,
                    slug: slug(input.name),
                    thumbnail: input.thumbnailUrl,
                },
            });

            if (input.thumbnailUrl && store.thumbnail && storeUpdated && isThumbnailChanged) {
                await Promise.all([
                    prisma.upload.update({
                        where: {
                            url: store.thumbnail,
                        },
                        data: {
                            isLinked: false,
                        },
                    }),
                    prisma.upload.update({
                        where: {
                            url: input.thumbnailUrl,
                        },
                        data: {
                            isLinked: true,
                        },
                    }),
                ]);
            }

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
    getOverviewCards: admin
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const now = new Date();

            const currentStart = startOfMonth(now);
            const currentEnd = now;

            const previousStart = startOfMonth(subMonths(now, 1));
            const previousEnd = subMonths(currentEnd, 1);

            const [grossSalesDataCurrent, grossSalesDataPrevious] = await Promise.all([
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                        createdAt: {
                            gte: currentStart,
                            lte: currentEnd,
                        },
                    },
                    select: {
                        discountSnapshot: true,
                    },
                }),
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                        createdAt: {
                            gte: previousStart,
                            lte: previousEnd,
                        },
                    },
                    select: {
                        discountSnapshot: true,
                    },
                }),
            ]);

            const [totalOrderCurrent, totalOrderPrevious] = await Promise.all([
                prisma.order.count({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                        createdAt: {
                            gte: currentStart,
                            lte: currentEnd,
                        },
                    },
                }),
                prisma.order.count({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                        createdAt: {
                            gte: previousStart,
                            lte: previousEnd,
                        },
                    },
                }),
            ]);

            const grossSalesCurrent = grossSalesDataCurrent
                .map((item) => item.discountSnapshot as DiscountSnapshot)
                .reduce((total, item) => total + (item.subtotal + item.savings), 0);
            const grossSalesPrevious = grossSalesDataPrevious
                .map((item) => item.discountSnapshot as DiscountSnapshot)
                .reduce((total, item) => total + (item.subtotal + item.savings), 0);

            const avgOrderValueCurrent =
                grossSalesDataCurrent.map((item) => item.discountSnapshot as DiscountSnapshot).reduce((total, item) => total + item.total, 0) /
                Math.max(totalOrderCurrent, 1);
            const avgOrderValuePrevious =
                grossSalesDataPrevious.map((item) => item.discountSnapshot as DiscountSnapshot).reduce((total, item) => total + item.total, 0) /
                Math.max(totalOrderPrevious, 1);

            const [netRevenueDataCurrent, netRevenueDataPrevious] = await Promise.all([
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["DELIVERED"],
                        },
                        createdAt: {
                            gte: currentStart,
                            lte: currentEnd,
                        },
                    },
                    select: {
                        discountSnapshot: true,
                    },
                }),
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["DELIVERED"],
                        },
                        createdAt: {
                            gte: previousStart,
                            lte: previousEnd,
                        },
                    },
                    select: {
                        discountSnapshot: true,
                    },
                }),
            ]);

            const netRevenueCurrent = netRevenueDataCurrent
                .map((item) => item.discountSnapshot as DiscountSnapshot)
                .reduce((total, item) => total + item.total, 0);
            const netRevenuePrevious = netRevenueDataPrevious
                .map((item) => item.discountSnapshot as DiscountSnapshot)
                .reduce((total, item) => total + item.total, 0);

            // const [orderCompletedCountCurrent, orderCompletedCountPrevious] = await Promise.all([
            //     prisma.order.count({
            //         where: {
            //             storeId: input.storeId,
            //             status: {
            //                 in: ["DELIVERED"],
            //             },
            //             createdAt: {
            //                 gte: currentStart,
            //                 lte: currentEnd,
            //             },
            //         },
            //     }),
            //     prisma.order.count({
            //         where: {
            //             storeId: input.storeId,
            //             status: {
            //                 in: ["DELIVERED"],
            //             },
            //             createdAt: {
            //                 gte: previousStart,
            //                 lte: previousEnd,
            //             },
            //         },
            //     }),
            // ]);

            const [refundValueDataCurrent, refundValueDataPrevious] = await Promise.all([
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["REFUND"],
                        },
                        createdAt: {
                            gte: currentStart,
                            lte: currentEnd,
                        },
                    },
                    select: {
                        discountSnapshot: true,
                    },
                }),
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: {
                            in: ["REFUND"],
                        },
                        createdAt: {
                            gte: previousStart,
                            lte: previousEnd,
                        },
                    },
                    select: {
                        discountSnapshot: true,
                    },
                }),
            ]);

            const refundValueCurrent = refundValueDataCurrent
                .map((item) => item.discountSnapshot as DiscountSnapshot)
                .reduce((total, item) => total + item.total, 0);
            const refundValuePrevious = refundValueDataPrevious
                .map((item) => item.discountSnapshot as DiscountSnapshot)
                .reduce((total, item) => total + item.total, 0);

            const [firstOrdersInPeriodCurrent, firstOrdersInPeriodPrevious] = await Promise.all([
                prisma.order.groupBy({
                    by: ["userId"],
                    where: {
                        storeId: input.storeId,
                        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
                    },
                    _min: {
                        createdAt: true,
                    },
                    having: {
                        createdAt: {
                            _min: {
                                gte: currentStart,
                                lte: currentEnd,
                            },
                        },
                    },
                }),
                prisma.order.groupBy({
                    by: ["userId"],
                    where: {
                        storeId: input.storeId,
                        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
                    },
                    _min: {
                        createdAt: true,
                    },
                    having: {
                        createdAt: {
                            _min: {
                                gte: previousStart,
                                lte: previousEnd,
                            },
                        },
                    },
                }),
            ]);

            const newBuyingCustomersCountCurrent = firstOrdersInPeriodCurrent.length;
            const newBuyingCustomersCountPrevious = firstOrdersInPeriodPrevious.length;

            return {
                grossSalesCurrent,
                grossSalesPrevious,
                netRevenueCurrent,
                netRevenuePrevious,
                avgOrderValueCurrent,
                avgOrderValuePrevious,
                refundValueCurrent,
                refundValuePrevious,
                newBuyingCustomersCountCurrent,
                newBuyingCustomersCountPrevious,
            };
        }),
    getRevenueChart: admin
        .input(
            z.object({
                storeId: z.string().min(1),
                timePeriod: z.literal(["1_YEAR", "6_MONTH"]),
            }),
        )
        .handler(async ({ input }) => {
            const monthsCount = input.timePeriod === "1_YEAR" ? 12 : 6;

            const now = new Date();
            const startDateThisYear = startOfMonth(subMonths(now, monthsCount - 1));
            const endDateThisYear = now;

            const startDatePriorYear = subMonths(startDateThisYear, 12);
            const endDatePriorYear = subMonths(endDateThisYear, 12);

            const [ordersThisYear, ordersPriorYear] = await Promise.all([
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
                        createdAt: { gte: startDateThisYear, lte: endDateThisYear },
                    },
                    select: { discountSnapshot: true, createdAt: true },
                }),
                prisma.order.findMany({
                    where: {
                        storeId: input.storeId,
                        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
                        createdAt: { gte: startDatePriorYear, lte: endDatePriorYear },
                    },
                    select: { discountSnapshot: true, createdAt: true },
                }),
            ]);

            const thisYearSalesMap = groupSalesByMonth(
                ordersThisYear.map((order) => ({ ...order, discountSnapshot: order.discountSnapshot as DiscountSnapshot })),
            );

            const priorYearSalesMap = groupSalesByMonth(
                ordersPriorYear.map((order) => ({ ...order, discountSnapshot: order.discountSnapshot as DiscountSnapshot })),
            );

            const chartData = Array.from({ length: monthsCount }).map((_, index) => {
                const targetDate = subMonths(now, monthsCount - 1 - index);
                const monthLabel = format(targetDate, "MMM, yyyy");

                return {
                    month: monthLabel,
                    grossSales: thisYearSalesMap[monthLabel] || 0,
                    priorYearSales: priorYearSalesMap[monthLabel] || 0,
                };
            });
            return chartData;
        }),
    getOrderByStatus: admin
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const now = new Date();

            const currentStart = startOfMonth(now);
            const currentEnd = now;

            const previousStart = startOfMonth(subMonths(now, 1));
            const previousEnd = subMonths(currentEnd, 1);

            const [thisOrderByStatus, previousOrderByStatus] = await Promise.all([
                prisma.order.groupBy({
                    by: ["status"],
                    where: {
                        storeId: input.storeId,
                        status: {
                            notIn: ["PENDING"],
                        },
                        createdAt: {
                            gte: currentStart,
                            lte: currentEnd,
                        },
                    },
                    _count: {
                        orderCode: true,
                    },
                }),
                prisma.order.groupBy({
                    by: ["status"],
                    where: {
                        storeId: input.storeId,
                        status: {
                            notIn: ["PENDING"],
                        },
                        createdAt: {
                            gte: previousStart,
                            lte: previousEnd,
                        },
                    },
                    _count: {
                        orderCode: true,
                    },
                }),
            ]);

            const thisOrderByStatusProcessing = thisOrderByStatus
                .filter((item) => item.status === "PAID" || item.status === "PROCESSING")
                .reduce((sum, item) => sum + item._count.orderCode, 0);
            const thisOrderByStatusShipped = thisOrderByStatus
                .filter((item) => item.status === "SHIPPED")
                .reduce((sum, item) => sum + item._count.orderCode, 0);
            const thisOrderByStatusClosed = thisOrderByStatus
                .filter((item) => item.status === "REFUND" || item.status === "CANCELLED")
                .reduce((sum, item) => sum + item._count.orderCode, 0);
            const thisOrderByStatusDelivered = thisOrderByStatus
                .filter((item) => item.status === "DELIVERED")
                .reduce((sum, item) => sum + item._count.orderCode, 0);

            const previousOrderByStatusProcessing = previousOrderByStatus
                .filter((item) => item.status === "PAID" || item.status === "PROCESSING")
                .reduce((sum, item) => sum + item._count.orderCode, 0);
            const previousOrderByStatusShipped = previousOrderByStatus
                .filter((item) => item.status === "SHIPPED")
                .reduce((sum, item) => sum + item._count.orderCode, 0);
            const previousOrderByStatusClosed = previousOrderByStatus
                .filter((item) => item.status === "REFUND" || item.status === "CANCELLED")
                .reduce((sum, item) => sum + item._count.orderCode, 0);
            const previousOrderByStatusDelivered = previousOrderByStatus
                .filter((item) => item.status === "DELIVERED")
                .reduce((sum, item) => sum + item._count.orderCode, 0);

            const thisTotalOrder = thisOrderByStatus.reduce((sum, item) => sum + item._count.orderCode, 0);
            return {
                thisTotalOrder,
                percentageProcessing: (thisOrderByStatusProcessing / thisTotalOrder) * 100,
                percentageShipped: (thisOrderByStatusShipped / thisTotalOrder) * 100,
                percentageDelivered: (thisOrderByStatusDelivered / thisTotalOrder) * 100,
                percentageClosed: (thisOrderByStatusClosed / thisTotalOrder) * 100,
                changeProcessing: calculatePercentageChange(thisOrderByStatusProcessing, previousOrderByStatusProcessing),
                changeShipped: calculatePercentageChange(thisOrderByStatusShipped, previousOrderByStatusShipped),
                changeDelivered: calculatePercentageChange(thisOrderByStatusDelivered, previousOrderByStatusDelivered),
                changeClosed: calculatePercentageChange(thisOrderByStatusClosed, previousOrderByStatusClosed),
            };
        }),
    getSalesByCategory: admin
        .input(
            z.object({
                storeId: z.string().min(1),
                categoryId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const now = new Date();

            const currentStart = startOfMonth(now);
            const currentEnd = now;

            const previousStart = startOfMonth(subMonths(now, 1));
            const previousEnd = subMonths(currentEnd, 1);

            const category = await prisma.category.findUnique({
                where: {
                    id: input.categoryId,
                    storeId: input.storeId,
                },
                select: {
                    children: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            if (!category) {
                throw new ORPCError("NOT_FOUND");
            }

            const subcategoryIds = category.children.map((sub) => sub.id);

            const [thisOrderItems, previousOrderItems] = await Promise.all([
                prisma.orderItem.findMany({
                    where: {
                        productVariant: {
                            product: {
                                categoryId: { in: subcategoryIds },
                            },
                        },
                        order: {
                            status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
                            createdAt: {
                                gte: currentStart,
                                lte: currentEnd,
                            },
                        },
                    },
                    select: {
                        quantity: true,
                        finalPrice: true,
                        originalPrice: true,
                        productVariant: {
                            select: { product: { select: { categoryId: true } } },
                        },
                    },
                }),
                prisma.orderItem.findMany({
                    where: {
                        productVariant: {
                            product: {
                                categoryId: { in: subcategoryIds },
                            },
                        },
                        order: {
                            status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
                            createdAt: {
                                gte: previousStart,
                                lte: previousEnd,
                            },
                        },
                    },
                    select: {
                        quantity: true,
                        finalPrice: true,
                        originalPrice: true,
                        productVariant: {
                            select: { product: { select: { categoryId: true } } },
                        },
                    },
                }),
            ]);

            const thisOrderData = thisOrderItems.map((item) => ({
                ...item,
                originalPrice: item.originalPrice.toNumber(),
                finalPrice: item.finalPrice.toNumber(),
            }));

            const previousOrderData = previousOrderItems.map((item) => ({
                ...item,
                originalPrice: item.originalPrice.toNumber(),
                finalPrice: item.finalPrice.toNumber(),
            }));

            const thisCategoriesData = category.children.map((child) => ({
                ...child,
                shortName: child.name.slice(0, 1),
                revenue: thisOrderData
                    .filter((item) => item.productVariant.product.categoryId === child.id)
                    .reduce((total, i) => total + i.quantity * i.originalPrice, 0),
                orderItems: thisOrderData
                    .filter((item) => item.productVariant.product.categoryId === child.id)
                    .reduce((total, i) => total + i.quantity, 0),
            }));

            const previousCategoriesData = category.children.map((child) => ({
                ...child,
                shortName: child.name.slice(0, 1),
                revenue: previousOrderData
                    .filter((item) => item.productVariant.product.categoryId === child.id)
                    .reduce((total, i) => total + i.quantity * i.originalPrice, 0),
                orderItems: previousOrderData
                    .filter((item) => item.productVariant.product.categoryId === child.id)
                    .reduce((total, i) => total + i.quantity, 0),
            }));

            const categoriesSalesData = thisCategoriesData.map((item) => ({
                ...item,
                change: calculatePercentageChange(item.orderItems, previousCategoriesData.find((i) => i.id === item.id)?.orderItems || 0),
            }));
            return categoriesSalesData;
        }),
    getTopSellingProducts: admin
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const now = new Date();

            const currentStart = startOfMonth(now);
            const currentEnd = now;

            const topSellingProducts = await prisma.orderItem.groupBy({
                by: ["productVariantId"],
                where: {
                    order: {
                        storeId: input.storeId,
                        status: {
                            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                        createdAt: {
                            gte: currentStart,
                            lte: currentEnd,
                        },
                    },
                },
                _sum: {
                    quantity: true,
                },
                orderBy: {
                    _sum: {
                        quantity: "desc",
                    },
                },
                take: 10,
            });

            const productVariantsInfo = await prisma.productVariant.findMany({
                where: {
                    id: {
                        in: topSellingProducts.map((item) => item.productVariantId),
                    },
                },
                select: {
                    combination: true,
                    id: true,
                    price: true,
                    product: {
                        select: {
                            name: true,
                            images: {
                                select: {
                                    url: true,
                                },
                                take: 1,
                            },
                        },
                    },
                },
            });
            return productVariantsInfo.map((variant) => ({
                ...variant,
                price: variant.price.toNumber(),
                combination: variant.combination as Record<string, string>,
                sales: topSellingProducts.find((product) => product.productVariantId === variant.id)?._sum.quantity || 0,
            }));
        }),
    getProductsLowStock: admin
        .input(
            z.object({
                storeId: z.string().min(1),
            }),
        )
        .handler(async ({ input }) => {
            const productVariants = await prisma.productVariant.findMany({
                where: {
                    product: {
                        storeId: input.storeId,
                        status: "PUBLISHED",
                    },
                    stock: {
                        lte: LOW_STOCK,
                    },
                },
                select: {
                    combination: true,
                    id: true,
                    price: true,
                    stock: true,
                    product: {
                        select: {
                            name: true,
                            images: {
                                select: {
                                    url: true,
                                },
                                take: 1,
                            },
                        },
                    },
                },
            });
            return productVariants.map((variant) => ({
                ...variant,
                price: variant.price.toNumber(),
                combination: variant.combination as Record<string, string>,
            }));
        }),
});
