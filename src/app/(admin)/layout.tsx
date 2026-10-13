import type { Metadata } from "next";
import { ModalsProvider } from "@/providers/modals-provider";
import { Geist_Mono, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

interface LayoutProps {
    children: React.ReactNode;
}

const fontSans = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "E-commerce admin",
    description: "E-commerce admin",
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className={cn(fontSans.variable, fontMono.variable)}>
            <ModalsProvider />
            {children}
        </div>
    );
};

export default Layout;
