import { ConfettiProvider } from "@/providers/confetti-provider";
import type { Metadata } from "next";
import { Montserrat, Noto_Serif_Georgian, Fira_Code } from "next/font/google";

interface LayoutProps {
    children: React.ReactNode;
}
const fontSans = Montserrat({
    subsets: ["latin"],
    variable: "--font-sans",
});

const fontSerif = Noto_Serif_Georgian({
    subsets: ["latin"],
    variable: "--font-serif",
});

const fontMono = Fira_Code({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "E-commerce store",
    description: "E-commerce store",
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className={`theme-store ${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
            <ConfettiProvider />
            {children}
        </div>
    );
};

export default Layout;
