"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, ChevronDownIcon, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CategoriesGetManyWithPromotion } from "../types";
import { CategoryActions } from "./category-actions";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PromotionItem } from "./promotion-item";
import { Label } from "@/components/ui/label";

export const columns: ColumnDef<CategoriesGetManyWithPromotion[number]>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const name = row.original.name;

            return <p className="line-clamp-1">{name}</p>;
        },
    },
    {
        accessorKey: "billboard",
        header: "Billboard",
        cell: ({ row }) => {
            const billboardLabel = row.original.billboard.label;

            return <p className="line-clamp-1">{billboardLabel}</p>;
        },
    },
    {
        accessorKey: "promotions",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
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
                return (
                    <p className="line-clamp-1 text-sm text-neutral-500">No promotional offers</p>
                );
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
                        <CollapsibleContent className="border-t bg-muted/50">
                            <div className="space-y-1 p-2">
                                {promotions.map((promotion) => (
                                    <div
                                        key={promotion.id}
                                        className="flex items-center gap-2 rounded-md text-sm hover:bg-background"
                                    >
                                        <PromotionItem
                                            storeId={storeId}
                                            categoryId={id}
                                            item={promotion}
                                        />
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
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
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

            return (
                <CategoryActions id={id} storeId={storeId}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for category ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </CategoryActions>
            );
        },
    },
];
