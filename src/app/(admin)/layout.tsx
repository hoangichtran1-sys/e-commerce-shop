import type { Metadata } from "next";
import { ModalsProvider } from "@/providers/modals-provider";
import { Inter } from "next/font/google";

interface LayoutProps {
    children: React.ReactNode;
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "E-commerce admin",
    description: "E-commerce admin",
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className={`${inter.className}`}>
            <ModalsProvider />
            {children}
        </div>
    );
};

export default Layout;
