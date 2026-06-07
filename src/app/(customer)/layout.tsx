import { ConfettiProvider } from "@/providers/confetti-provider";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

interface LayoutProps {
    children: React.ReactNode;
}

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

export const metadata: Metadata = {
    title: "E-commerce store",
    description: "E-commerce store",
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className={`${plusJakartaSans.variable}`}>
            <ConfettiProvider />
            {children}
        </div>
    );
};

export default Layout;
