import { auth } from "@/lib/auth";
import { ORPCError, os } from "@orpc/server";

type Session = typeof auth.$Infer.Session;

export type Context = {
    session: Session | null;
};

export const base = os.$context<Context>();

export const authed = base.use(async ({ next, context }) => {
    if (!context.session) {
        throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    return next({
        context: {
            user: context.session.user,
        },
    });
});

export const admin = authed.use(async ({ next, context }) => {
    if (context.user.role !== "admin") {
        throw new ORPCError("FORBIDDEN", { message: "Forbidden" });
    }

    return next({
        context: { user: context.user },
    });
});
