import { ProductStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export const variantItemSchema = z.object({
    sku: z
        .string()
        .trim()
        .uppercase()
        .min(3)
        .max(50)
        .regex(/^[A-Z0-9-]+$/, "SKU chỉ được chứa chữ hoa, số và dấu gạch ngang (-)"),
    price: z.number().min(0.01),
    stock: z.number().int().min(0),
    combination: z.record(z.string(), z.string()),
});

export const createProductWithVariantsSchema = z.object({
    storeId: z.string().min(1),
    categoryId: z.string().min(1),
    name: z.string().min(1),
    status: z.enum(ProductStatus),
    isFeatured: z.boolean(),
    images: z.array(z.string()).min(1).max(3),
    description: z.string().nullable(),
    features: z.array(z.string()),
    variants: z.array(variantItemSchema).min(1, "Sản phẩm phải có ít nhất một biến thể"),
});

export const updateProductWithVariantsSchema = createProductWithVariantsSchema.extend({
    id: z.string().min(1),
});
