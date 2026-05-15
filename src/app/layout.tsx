import type { Metadata } from "next";
import { ORPCQueryProvider } from "@/orpc/orpc-rq.client";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "E-commerce",
    description: "E-commerce",
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
                    <NuqsAdapter>
                        <TooltipProvider>{children}</TooltipProvider>
                        <Toaster />
                        <ReactQueryDevtools initialIsOpen={false} />
                    </NuqsAdapter>
                </ORPCQueryProvider>
            </body>
        </html>
    );
}
