import { Outputs } from "@/orpc/routers/_app";

export type GetStores = Outputs["customer"]["getStores"];
export type GetCategories = Outputs["customer"]["getCategoriesInStore"];
export type GetBillboard = Outputs["customer"]["getBillboardGlobal"]
export type GetProducts = Outputs["customer"]["getProducts"]
export type GetProduct = Outputs["customer"]["getProduct"]
export type GetCategory = Outputs["customer"]["getCategory"]
export type GetReview = Outputs["customer"]["getReview"]

