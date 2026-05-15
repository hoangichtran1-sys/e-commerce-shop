import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import slug from "slug";

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

export function generateSKU(name: string, color?: string, size?: string) {
    const base = slug(`${name} ${color?.slice(1) || ""} ${size || ""}`, {
        lower: true,
    });

    const suffix = generateRandomCode(6);

    return `${base.toUpperCase()}-${suffix}`;
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
