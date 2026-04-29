import { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { storesRouter } from "@/features/admin/stores/server/routers";
import { base } from "../init";

export const router = base.router({
    stores: storesRouter,
});

export type Router = typeof router;

export type Inputs = InferRouterInputs<Router>;
export type Outputs = InferRouterOutputs<Router>;
