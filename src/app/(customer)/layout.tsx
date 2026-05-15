import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

interface LayoutProps {
    children: React.ReactNode;
}

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
    title: "E-commerce store",
    description: "E-commerce store",
};

const Layout = ({ children }: LayoutProps) => {
    return <div className={`${plusJakartaSans.variable}`}>{children}</div>;
};

export default Layout;
