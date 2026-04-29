"use server";

import { prisma } from "@/lib/prisma";

export async function getStores(userId: string) {
    const stores = await prisma.store.findMany({
        where: {
            userId,
        }
    })

    return stores
}