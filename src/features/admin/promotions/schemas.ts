import { PromotionMode, PromotionType } from "@/generated/prisma/enums";
import { z } from "zod";

export const formPromotionSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        categoryIds: z.array(z.string()),
        type: z.enum(PromotionType),
        mode: z.enum(PromotionMode),
        value: z.number(),
        startAt: z.date(),
        endAt: z.date(),
        isActive: z.boolean(),
        minOrderValue: z.number().min(0),
        maxDiscountValue: z.number().nullable(),
    })
    .refine((data) => data.endAt > data.startAt, {
        message: "The end date must be after the start date",
        path: ["endAt"],
    })
    .refine(
        (data) => {
            if (data.type === "PERCENT") {
                return Number.isInteger(data.value) && data.value >= 1 && data.value <= 100;
            }

            return true;
        },
        {
            message: "The percentage discount must be between 1 and 100",
            path: ["value"],
        },
    )
    .refine(
        (data) => {
            if (data.type === "FIXED") {
                return data.value > 0;
            }

            return true;
        },
        {
            message: "The fixed amount must greater than 0",
            path: ["value"],
        },
    )
    .refine(
        (data) => {
            if (data.type === "PERCENT" && data.maxDiscountValue !== null) {
                return data.maxDiscountValue > 0;
            }
            return true;
        },
        {
            message: "The maximum reduction value must be greater than 0",
            path: ["maxDiscountValue"],
        },
    )
    .refine(
        (data) => {
            if (data.type === "FIXED") {
                return data.value <= data.minOrderValue;
            }
            return true;
        },
        {
            message: "The discount value should not exceed the minimum order value",
            path: ["minOrderValue"],
        },
    );

export const insertPromotionSchema = z.object({
    name: z.string().min(1),
    storeId: z.string().min(1),
    categoryIds: z.array(z.string()),
    type: z.enum(PromotionType),
    mode: z.enum(PromotionMode),
    value: z.number(),
    startAt: z.date(),
    endAt: z.date(),
    isActive: z.boolean(),
    minOrderValue: z.number().min(0),
    maxDiscountValue: z.number().nullable(),
});
