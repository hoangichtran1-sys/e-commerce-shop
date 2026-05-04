import { z } from "zod";

export const createProductSchema = z.object({
    storeId: z.string().min(1),
    categoryId: z.string().min(1),
    sizeId: z.string().min(1),
    colorId: z.string().min(1),
    name: z.string().min(1),
    price: z.number().min(0.01),
    isFeatured: z.boolean(),
    isArchived: z.boolean(),
    images: z.array(z.string()).min(1).max(3),
})

export const updateProductSchema = createProductSchema.extend({
    id: z.string().min(1)
})