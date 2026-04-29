import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ORPCQueryProvider } from "@/orpc/orpc-rq.client";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModalsProvider } from "@/providers/modals-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "E-commerce",
    description: "E-commerce Shop",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.className} h-full antialiased`}>
            <body className="min-h-full flex flex-col">
                <ORPCQueryProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                    <Toaster />
                    <ModalsProvider />
                    <ReactQueryDevtools initialIsOpen={false} />
                </ORPCQueryProvider>
            </body>
        </html>
    );
}
