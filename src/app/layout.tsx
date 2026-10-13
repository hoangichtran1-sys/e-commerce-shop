import { ORPCQueryProvider } from "@/orpc/orpc-rq.client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next";

import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full antialiased">
            <body className="min-h-full flex flex-col">
                <ORPCQueryProvider>
                    <NuqsAdapter>
                        <ThemeProvider storageKey="ecommerce-theme" attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                            <TooltipProvider>{children}</TooltipProvider>
                        </ThemeProvider>
                        <Toaster />
                        <ReactQueryDevtools initialIsOpen={false} />
                    </NuqsAdapter>
                </ORPCQueryProvider>
            </body>
        </html>
    );
}
