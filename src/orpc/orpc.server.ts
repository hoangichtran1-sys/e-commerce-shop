import "server-only";

import { createRouterClient } from "@orpc/server";
import { router } from "@/orpc/routers/_app";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

globalThis.$client = createRouterClient(router, {
    /**
     * Provide initial context if needed.
     *
     * Because this client instance is shared across all requests,
     * only include context that's safe to reuse globally.
     * For per-request context, use middleware context or pass a function as the initial context.
     */
    context: async () => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        return { session };
    },
});
