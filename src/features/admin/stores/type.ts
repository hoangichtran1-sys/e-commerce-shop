import { Outputs } from "@/orpc/routers/_app";

export type StoreGetMany = Outputs["stores"]["getMany"];
export type GetRevenueChart = Outputs["stores"]["getRevenueChart"];
export type GetSalesByCategory = Outputs["stores"]["getSalesByCategory"];
export type GetOrdersByStatus = Outputs["stores"]["getOrderByStatus"];
export type GetTopSellingProducts = Outputs["stores"]["getTopSellingProducts"];
export type GetProductsLowStock = Outputs["stores"]["getProductsLowStock"];
