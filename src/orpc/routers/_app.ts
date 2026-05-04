import { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { base } from "../init";

import { storesRouter } from "@/features/admin/stores/server/routers";
import { billboardsRouter } from "@/features/admin/billboards/server/routers";
import { categoriesRouter } from "@/features/admin/categories/server/routers";
import { sizesRouter } from "../../features/admin/sizes/server/routers";
import { colorsRouter } from "@/features/admin/colors/server/routers";
import { productsRouter } from "@/features/admin/products/server/routers";
import { ordersRouter } from "@/features/admin/orders/server/routers";

export const router = base.router({
    stores: storesRouter,
    billboards: billboardsRouter,
    categories: categoriesRouter,
    sizes: sizesRouter,
    colors: colorsRouter,
    products: productsRouter,
    orders: ordersRouter,
});

export type Router = typeof router;

export type Inputs = InferRouterInputs<Router>;
export type Outputs = InferRouterOutputs<Router>;
