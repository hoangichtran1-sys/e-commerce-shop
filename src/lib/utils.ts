import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Variant } from "./generate-variants";
import { PromotionType } from "@/generated/prisma/enums";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}

export function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str: string) {
    return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

export function snakeCaseToTitle(str: string) {
    return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPhone(phone: string) {
    const parsed = parsePhoneNumberFromString(phone);
    return parsed?.formatInternational() || phone;
}

export function getCountryName(code?: string) {
    if (!code) return "";

    const name = new Intl.DisplayNames(["en"], {
        type: "region",
    }).of(code);

    return name ?? code;
}

export function getFlagEmoji(countryCode: string) {
    return countryCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function generateRandomCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorCode(error: any) {
    return error?.code || error?.data?.code;
}

export function safeRedirect(url: string | null) {
    if (!url) return "/";

    if (url.startsWith("/")) return url;

    return "/";
}

export function formatNumber(num: number): string {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
}

export function generateSearchable(variants: Variant[]) {
    if (!variants || variants.length === 0) return [];

    const searchable = new Set<string>();
    variants
        .map((attr) => attr.combination)
        .forEach((variant) => {
            Object.entries(variant).forEach(([key, value]) => {
                const safeKey = key.trim().toLowerCase();
                const safeValue = String(value).trim();
                searchable.add(`${safeKey}:${safeValue}`);
            });
        });
    return Array.from(searchable);
}

export const checkDuplicate = (arr: string[]) => new Set(arr).size !== arr.length;
export const normalize = (s: string) => s.toLowerCase();

export function getMinPrice(variants: Variant[]) {
    const allPrice = variants.map((variant) => variant.price);

    return Math.min(...allPrice);
}

export function getMaxPrice(variants: Variant[]) {
    const allPrice = variants.map((variant) => variant.price);

    return Math.max(...allPrice);
}

export function getAttributesFromVariants(variants: (Variant & { id: string })[]) {
    const attributes: Record<string, Set<string>> = {};

    variants.forEach((variant) => {
        const combo = variant.combination;
        if (combo) {
            Object.entries(combo).forEach(([key, value]) => {
                if (!attributes[key]) {
                    attributes[key] = new Set();
                }
                attributes[key].add(value);
            });
        }
    });

    const result: Record<string, string[]> = {};
    Object.entries(attributes).forEach(([key, set]) => {
        result[key] = Array.from(set);
    });

    return result;
}

export function applyPromotion(price: number, promotion?: { type: PromotionType; maxDiscountValue: number | null; value: number }) {
    if (!promotion) return { finalPrice: price, discountValue: 0 };

    if (promotion.type === "PERCENT") {
        let discount = price * (promotion.value / 100);

        if (promotion.maxDiscountValue) {
            discount = Math.min(discount, promotion.maxDiscountValue);
        }

        return {
            finalPrice: price - discount,
            discountValue: discount,
        };
    }

    if (promotion.type === "FIXED") {
        return {
            finalPrice: price - promotion.value,
            discountValue: promotion.value,
        };
    }
}

export function downloadFromUrl(url: string | null, filename: string) {
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;

    link.download = filename || "download";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function getCountryDisplay(countryCode: string | null) {
    if (!countryCode) return "Unknown";

    try {
        const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
        return regionNames.of(countryCode.toUpperCase()) || countryCode;
    } catch {
        return countryCode;
    }
}

export function calculatePercentageChange(current: number, previous: number): number {
    // Trường hợp 1: Cả 2 tháng đều bằng 0 -> Không có sự thay đổi
    if (previous === 0 && current === 0) {
        return 0;
    }

    // Trường hợp 2: Tháng trước bằng 0 nhưng tháng này có doanh thu -> Tăng trưởng tuyệt đối 100%
    if (previous === 0 && current > 0) {
        return 100;
    }

    const change = ((current - previous) / Math.max(previous, 1)) * 100;

    return Math.round(change * 10) / 10;
}

export function formatPriceDashboard(amount: number, currency: string = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}
