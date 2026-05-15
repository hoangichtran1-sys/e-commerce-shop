import { AuthLayout } from "@/features/auth/components/auth-layout";
import { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "E-commerce auth",
    description: "E-commerce auth",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
    return <AuthLayout className={inter.className}>{children}</AuthLayout>;
};

export default Layout;
