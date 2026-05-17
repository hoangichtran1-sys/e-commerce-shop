import { Outputs } from "@/orpc/routers/_app";
import { Prisma } from "@/generated/prisma/client";

export type GetStores = Outputs["customer"]["getStores"];
export type GetCategories = Outputs["customer"]["getCategoriesInStore"];
export type GetBillboard = Outputs["customer"]["getBillboardGlobal"];
export type GetProducts = Outputs["customer"]["getProducts"];
export type GetProduct = Outputs["customer"]["getProduct"];
export type GetCategory = Outputs["customer"]["getCategory"];
export type GetReview = Outputs["customer"]["getReview"];

export const PRODUCTS_SORT = {
    IN_STOCK: "in_stock",
    NEWEST: "newest",
    FEATURED: "featured",
    PRICE_LOW: "price_low",
    PRICE_HIGH: "price_high",
} as const;

export const sortValues = Object.values(PRODUCTS_SORT);

export type ProductsSort = (typeof PRODUCTS_SORT)[keyof typeof PRODUCTS_SORT];

export const sortMap = {
    newest: [{ createdAt: "desc" }, { id: "desc" }],
    in_stock: [{ inStock: "desc" }, { id: "desc" }],
    featured: [{ isFeatured: "desc" }, { id: "desc" }],
    price_low: [{ price: "asc" }, { id: "desc" }],
    price_high: [{ price: "desc" }, { id: "desc" }],
} as const satisfies Record<ProductsSort, Prisma.ProductOrderByWithRelationInput[]>;

export const FEATURES = {
    BEST_SELLER: "best_seller",
    TRENDING: "trending",
    TOP_RATED: "top_rated",
    TOP_FAVORITE: "top_favorite",
} as const;

export const featuresValue = Object.values(FEATURES);

export type Features = (typeof FEATURES)[keyof typeof FEATURES];