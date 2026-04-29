"use client";

import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface HintProps {
    children: React.ReactNode;
    text: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    className?: string;
}

export const Hint = ({
    children,
    text,
    side = "top",
    align = "center",
    className,
}: HintProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent
                className={cn(
                    "text-white shadow-lg",
                    className,
                )}
                side={side}
                align={align}
                sideOffset={5}
            >
                <span className="text-xs font-medium">{text}</span>
            </TooltipContent>
        </Tooltip>
    );
};