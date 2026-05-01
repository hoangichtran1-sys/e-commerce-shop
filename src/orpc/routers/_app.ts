import { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { storesRouter } from "@/features/admin/stores/server/routers";
import { base } from "../init";
import { billboardsRouter } from "@/features/admin/billboards/server/routers";

export const router = base.router({
    stores: storesRouter,
    billboards: billboardsRouter,
});

export type Router = typeof router;

export type Inputs = InferRouterInputs<Router>;
export type Outputs = InferRouterOutputs<Router>;
