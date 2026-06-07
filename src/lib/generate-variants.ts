import { DEFAULT_VARIANT } from "@/constants";

/* eslint-disable @typescript-eslint/no-unused-vars */
export type Variant = {
    combination: Record<string, string>;
    price: number;
    stock: number;
    sku: string;
};

export function generateVariants(selectedAttrs: Record<string, string[]>) {
    const entries = Object.entries(selectedAttrs).filter(([_, values]) => values.length > 0);
    if (entries.length === 0) return [DEFAULT_VARIANT];

    return entries.reduce((acc, [attrType, values]) => {
        const tmp: Variant[] = [];
        if (acc.length === 0) {
            return values.map((val) => ({
                combination: { [attrType]: val },
                price: 0,
                stock: 0,
                sku: "",
            }));
        }
        acc.forEach((prev) => {
            values.forEach((val) => {
                tmp.push({
                    ...prev,
                    combination: {
                        ...prev.combination,
                        [attrType]: val,
                    },
                });
            });
        });
        return tmp;
    }, [] as Variant[]);
}
