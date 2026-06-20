import nodemailer from "nodemailer";
import { env } from "./env";

export const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    auth: {
        user: env.MAIL_USERNAME,
        pass: env.MAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
        rejectUnauthorized: false,
        maxVersion: "TLSv1.2",
    },
});
