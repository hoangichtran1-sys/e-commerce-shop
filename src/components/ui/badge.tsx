import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { OrderStatus, PromotionMode, PromotionType, UploadType } from "@/generated/prisma/enums";

const badgeVariants = cva(
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
                secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
                destructive:
                    "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
                outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
                ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
                link: "text-primary underline-offset-4 hover:underline",
                tertiary: "bg-purple-500 text-primary-foreground [a]:hover:bg-purple-500/80",

                [PromotionType.PERCENT]:
                    "bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-600/20 dark:focus-visible:ring-amber-600/40 [a]:hover:bg-amber-600/20",
                [PromotionType.FIXED]:
                    "bg-sky-600/10 text-sky-600 focus-visible:ring-sky-600/20 dark:bg-sky-600/20 dark:focus-visible:ring-sky-600/40 [a]:hover:bg-sky-600/20",

                [PromotionMode.COUPON]: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
                [PromotionMode.CATEGORY_CAMPAIGN]: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",

                [OrderStatus.PENDING]: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
                [OrderStatus.PROCESSING]:
                    "border-none bg-amber-600/10 text-amber-700 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5",
                [OrderStatus.PAID]:
                    "border-none bg-green-600/10 text-green-700 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",
                [OrderStatus.SHIPPED]:
                    "border-none bg-blue-600/10 text-blue-700 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5",
                [OrderStatus.CANCELLED]:
                    "border-none bg-rose-600/10 text-rose-700 focus-visible:ring-rose-600/20 focus-visible:outline-none dark:bg-rose-400/10 dark:text-rose-400 dark:focus-visible:ring-rose-400/40 [a&]:hover:bg-rose-600/5 dark:[a&]:hover:bg-rose-400/5",
                [OrderStatus.DELIVERED]:
                    "border-none bg-purple-600/10 text-purple-700 focus-visible:ring-purple-600/20 focus-visible:outline-none dark:bg-purple-400/10 dark:text-purple-400 dark:focus-visible:ring-purple-400/40 [a&]:hover:bg-purple-600/5 dark:[a&]:hover:bg-purple-400/5",
                [OrderStatus.REFUND]:
                    "border-none bg-gray-600/10 text-gray-700 focus-visible:ring-gray-600/20 focus-visible:outline-none dark:bg-gray-400/10 dark:text-gray-400 dark:focus-visible:ring-gray-400/40 [a&]:hover:bg-gray-600/5 dark:[a&]:hover:bg-gray-400/5",
                [UploadType.STORE]: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                [UploadType.BILLBOARD]: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
                [UploadType.PRODUCT]: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function Badge({
    className,
    variant = "default",
    asChild = false,
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : "span";

    return <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
