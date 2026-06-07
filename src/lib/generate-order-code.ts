"use server";

import { format } from "date-fns";
import { prisma } from "./prisma";

export async function generateOrderCode(storeId: string) {
    const today = new Date();
    const dateStr = format(today, "yyMMdd");

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const orderCountToday = await prisma.order.count({
        where: {
            storeId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const sequenceStr = String(orderCountToday + 1).padStart(3, "0");

    return `ORD-${dateStr}-${sequenceStr}`;
}
