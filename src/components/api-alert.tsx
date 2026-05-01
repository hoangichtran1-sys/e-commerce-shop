"use client";

import { CopyIcon, ServerIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ApiAlertProps {
    title: string;
    description: string;
    variant: "public" | "admin";
}

const textMap: Record<ApiAlertProps["variant"], string> = {
    public: "Public",
    admin: "Admin",
};

const variantMap: Record<
    ApiAlertProps["variant"],
    "secondary" | "destructive"
> = {
    public: "secondary",
    admin: "destructive",
};

export const ApiAlert = ({
    title,
    description,
    variant = "public",
}: ApiAlertProps) => {
    const onCopy = (description: string) => {
        navigator.clipboard.writeText(description);
        toast.success("API Route copied to the clipboard.");
    };

    return (
        <Alert>
            <ServerIcon className="size-4" />
            <AlertTitle className="flex items-center gap-x-2">
                {title}
                <Badge variant={variantMap[variant]}>{textMap[variant]}</Badge>
            </AlertTitle>
            <AlertDescription className="mt-4 flex items-center justify-between">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                    {description}
                </code>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onCopy(description)}
                >
                    <CopyIcon className="size-4" />
                </Button>
            </AlertDescription>
        </Alert>
    );
};
