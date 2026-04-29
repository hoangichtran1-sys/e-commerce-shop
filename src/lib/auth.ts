import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "./env";

export const auth = betterAuth({
    appName: "E-commerce",
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (user.email === env.EMAIL_ADMIN) {
                        return {
                            data: {
                                ...user,
                                role: "admin",
                            },
                        };
                    }
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        maxPasswordLength: 100,
        autoSignIn: true,
    },
    socialProviders: {
        facebook: {
            clientId: env.FACEBOOK_CLIENT_ID,
            clientSecret: env.FACEBOOK_CLIENT_SECRET,
        },
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            allowDifferentEmails: false, // Recommend
            trustedProviders: ["google", "email-password", "facebook"],
        },
    },
    advanced: {
        cookiePrefix: "e-commerce-web",
    },
    user: {
        additionalFields: {
            role: {
                type: ["customer", "admin"],
                required: false,
                defaultValue: "customer",
                input: false, // don't allow user to set role
            },
        },
    },
    //trustedOrigins: [env.APP_URL],
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
