import { AuthLayout } from "@/features/auth/components/auth-layout";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Geist_Mono, JetBrains_Mono } from "next/font/google";

const fontSans = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "E-commerce auth",
    description: "E-commerce auth",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
    return <AuthLayout className={cn(fontSans.variable, fontMono.variable)}>{children}</AuthLayout>;
};

export default Layout;
