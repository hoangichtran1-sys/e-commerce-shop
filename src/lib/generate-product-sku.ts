import slug from "slug";
import { generateRandomCode } from "./utils";

export function generateSKU(name: string, values: Record<string, string>) {
    if (Object.keys(values).length === 0) {
        const base = slug(`${name}`, {
            lower: true,
        });

        const suffix = generateRandomCode(4);
        return `${base.toUpperCase()}-${suffix}`;
    }

    const comboValues = Object.values(values).join(" ");
    const baseSlug = slug(`${name} ${comboValues}`, {
        lower: true,
    });

    return `${baseSlug.toUpperCase()}`;
}
