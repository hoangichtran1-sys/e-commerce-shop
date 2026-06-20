/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/lib/env";
import { transporter } from "@/lib/nodemailer";

export interface SendMailProps {
    from?: string;
    email: string;
    subject: string;
    data?: Record<string, any>;
    html: string;
    replyTo?: string;
}

export async function sendEmail({ from, email, subject, html, replyTo }: SendMailProps) {
    try {
        const info = await transporter.sendMail({
            from: from || env.MAIL_FROM_ADDRESS,
            to: email,
            subject,
            html,
            replyTo,
        });
        console.log("Email sent: ", info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer Error: ", error);
        throw error;
    }
}
