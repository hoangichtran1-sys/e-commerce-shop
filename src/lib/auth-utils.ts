import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    if (session.user.role === "admin") {
        redirect("/admin");
    }

    return session;
};

export const requireUnauth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        if (session.user.role === "customer") {
            redirect("/");
        } else if (session.user.role === "admin") {
            redirect("/admin");
        }
    }
};

export const requireAdmin = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== "admin") {
        redirect("/");
    }

    return session;
};

export const getCurrentUser = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session || !session.user) {
        return null;
    }

    return session.user;
};
