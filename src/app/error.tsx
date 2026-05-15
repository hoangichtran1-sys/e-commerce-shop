"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

const Error = () => {
    return (
        <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
            <AlertTriangle className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Some thing went wrong</p>
            <Button onClick={() => Cookies.remove("storeSlug")} variant="secondary" size="sm" asChild>
                <Link href="/">Back to home</Link>
            </Button>
        </div>
    );
};

export default Error;
