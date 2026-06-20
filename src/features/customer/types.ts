import { Outputs } from "@/orpc/routers/_app";
import { Prisma } from "@/generated/prisma/client";

export type GetStores = Outputs["customer"]["getStores"];
export type GetCategories = Outputs["customer"]["getCategoriesParent"];
export type GetBillboard = Outputs["customer"]["getBillboardGlobal"];
export type GetProducts = Outputs["customer"]["getProducts"];
export type GetProductsRelated = Outputs["customer"]["getProductsRelated"];
export type GetProduct = Outputs["customer"]["getProduct"];
export type GetCategory = Outputs["customer"]["getCategory"];
export type GetOrdersHistory = Outputs["customer"]["getOrdersHistory"];
export type GetReview = Outputs["customer"]["getReview"];
export type GetReviews = Outputs["customer"]["getReviews"];
export type GetVariantsInCard = Outputs["customer"]["getVariantsInCart"];
export type GetPromotionCampaigns = Outputs["customer"]["getPromotionCampaigns"];

export const PRODUCTS_SORT = {
    NEWEST: "newest",
    FEATURED: "featured",
    PRICE_LOW: "price_low",
    PRICE_HIGH: "price_high",
    BEST_SELLER: "best_seller",
    TREDING_SCORE: "treding_score",
} as const;

export const sortValues = Object.values(PRODUCTS_SORT);

export type ProductsSort = (typeof PRODUCTS_SORT)[keyof typeof PRODUCTS_SORT];

export const sortMap = {
    newest: [{ createdAt: "desc" }, { id: "desc" }],
    featured: [{ features: "desc" }, { id: "desc" }],
    price_low: [{ minPrice: "asc" }, { id: "desc" }],
    price_high: [{ maxPrice: "desc" }, { id: "desc" }],
    best_seller: [{ soldCount: "desc" }, { id: "desc" }],
    treding_score: [{ trendingScore: "desc" }, { id: "desc" }],
} as const satisfies Record<ProductsSort, Prisma.ProductOrderByWithRelationInput[]>;

export const FEATURES = {
    TOP_TRENDING: "top_trending",
    FREE_SHIPPING: "free_shipping",
    TOP_RATED: "top_rated",
    TOP_FAVORITE: "top_favorite",
} as const;

export const featuresValue = Object.values(FEATURES);

export type Features = (typeof FEATURES)[keyof typeof FEATURES];

export type CheckoutMetadata = {
    orderId: string;
};

export type DiscountSnapshot = {
    subtotal: number;
    savings: number;
    shippingFee: number;
    discountCoupon: number;
    total: number;
};

export const REVIEWS_FILTER = {
    "1_STAR": "1",
    "2_STAR": "2",
    "3_STAR": "3",
    "4_STAR": "4",
    "5_STAR": "5",
    ALL: "all",
} as const;

export const reviewsFilter = Object.values(REVIEWS_FILTER);

export type ReviewsFilter = (typeof REVIEWS_FILTER)[keyof typeof REVIEWS_FILTER];

export type ReviewCursor = {
    id: string;
    createdAt: Date;
};
