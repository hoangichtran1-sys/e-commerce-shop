"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, ChevronDownIcon, ChevronRightIcon, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CategoriesGetManyWithPromotion } from "../types";
import { CategoryActions } from "./category-actions";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PromotionItem } from "./promotion-item";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<CategoriesGetManyWithPromotion[number]>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Category Name",
        cell: ({ row }) => {
            const currentName = row.original.name;
            const children = row.original.children;

            // const preview = children.slice(0, 3);
            // const remaining = children.length - 3;

            return (
                <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mb-0.5 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded w-fit">
                        Root
                    </span>
                    <Collapsible key={currentName}>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
                            >
                                <span className="font-medium text-sm text-foreground">{currentName}</span>
                                <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent
                            className="mt-1 ml-5 style-lyra:ml-4 overflow-hidden
        data-[state=closed]:animate-accordion-up
        data-[state=open]:animate-accordion-down"
                        >
                            <div className="flex flex-wrap gap-1">
                                {children.length === 0 && <span className="text-muted-foreground italic text-xs">No subcategories</span>}
                                {children.map((child) => (
                                    <Badge key={child.id} className="text-[11px]">
                                        {child.name}
                                    </Badge>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            );
        },
    },
    {
        accessorKey: "billboard",
        header: "Billboard",
        cell: ({ row }) => {
            const billboardLabel = row.original.billboard?.label;

            if (!billboardLabel) {
                return <p className="text-muted-foreground italic">N/A</p>;
            }

            return <p className="line-clamp-1">{billboardLabel}</p>;
        },
    },
    {
        accessorKey: "promotions",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Campaigns
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const promotions = row.original.promotions;
            const storeId = row.original.storeId;
            const id = row.original.id;

            if (promotions.length === 0) {
                return <p className="line-clamp-1 text-sm text-neutral-500">No promotional offers</p>;
            }

            return (
                <div className="w-full max-w-sm rounded-lg border bg-card">
                    <Label htmlFor={`${id}-campaigns`} className="sr-only">
                        Campaigns
                    </Label>
                    <Collapsible>
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-muted">
                            <span className="font-semibold">{promotions.length} promotion</span>
                            <ChevronDownIcon className="size-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent
                            className="border-t bg-muted/50 overflow-hidden
        data-[state=closed]:animate-accordion-up
        data-[state=open]:animate-accordion-down"
                        >
                            <div className="space-y-1 p-2">
                                {promotions.map((promotion) => (
                                    <div key={promotion.id} className="flex items-center gap-2 rounded-md text-sm bg-white hover:bg-muted/30">
                                        <PromotionItem storeId={storeId} categoryId={id} item={promotion} />
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Created At
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAtFormatted = format(row.original.createdAt, "MMMM do, yyyy");

            return <p className="line-clamp-1">{createdAtFormatted}</p>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;
            const slug = row.original.slug;

            return (
                <CategoryActions slug={slug} id={id} storeId={storeId}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for category ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </CategoryActions>
            );
        },
    },
];
