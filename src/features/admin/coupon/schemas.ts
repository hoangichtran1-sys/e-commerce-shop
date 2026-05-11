import { z } from "zod";

export const formCouponSchema = z
    .object({
        promotionId: z.string().min(1),
        code: z
            .string()
            .min(3, "The code is too short")
            .max(20, "The code is too long")
            .regex(/^[A-Z0-9]+$/, "The code can only contain uppercase letters and numbers")
            .transform((val) => val.trim().toUpperCase()),
        usageLimit: z.number().min(1).nullable(),
        perUserLimit: z.number().min(1).nullable(),
    })
    .refine(
        (data) => {
            if (data.usageLimit && data.perUserLimit) {
                return data.perUserLimit <= data.usageLimit;
            }
            return true;
        },
        {
            message: "The per user limit should not exceed the usage limit",
            path: ["perUserLimit"],
        },
    );

export const insertCouponSchema = z.object({
    storeId: z.string().min(1),
    promotionId: z.string().min(1),
    code: z.string(),
    usageLimit: z.number().nullable(),
    perUserLimit: z.number().nullable(),
});
