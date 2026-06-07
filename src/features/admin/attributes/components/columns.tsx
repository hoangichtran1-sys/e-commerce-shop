"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, LucideIcon, MoreVerticalIcon, PaletteIcon, RulerIcon, ShirtIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { AttributeActions } from "./attribute-actions";
import { AttributesGetMany } from "../types";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirst } from "@/lib/utils";
import { AttributeType } from "@/generated/prisma/enums";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const iconAttribute: Record<AttributeType, LucideIcon> = {
    [AttributeType.COLOR]: PaletteIcon,
    [AttributeType.SIZE]: RulerIcon,
    [AttributeType.MATERIAL]: ShirtIcon,
};

export const columns: ColumnDef<AttributesGetMany[number]>[] = [
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
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
        accessorKey: "type",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Type
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const type = row.original.type;
            const Icon = iconAttribute[type];

            return (
                <Badge className="p-2" variant="outline">
                    <div className="flex items-center gap-x-2">
                        <Icon className="size-3" />
                        {capitalizeFirst(type as string)}
                    </div>
                </Badge>
            );
        },
    },
    {
        accessorKey: "values",
        header: "Values",
        cell: ({ row }) => {
            const items = row.original.values;

            if (items.length === 0) {
                return <p className="text-muted-foreground italic">No values</p>;
            }

            if (items.length < 3) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {items.map((item, index) => (
                            <Badge key={index} variant="outline" className="whitespace-nowrap">
                                {item.value}
                            </Badge>
                        ))}
                    </div>
                );
            }

            const firstItem = items[0];
            const secondItem = items[1];
            const thirdItem = items[2];
            const remainingItems = items.slice(3);

            return (
                <div className="flex items-center gap-x-2">
                    <Badge variant="outline" className="whitespace-nowrap">
                        {firstItem.value}
                    </Badge>
                    <Badge variant="outline" className="whitespace-nowrap">
                        {secondItem.value}
                    </Badge>
                    <Badge variant="outline" className="whitespace-nowrap">
                        {thirdItem.value}
                    </Badge>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors">
                                +{remainingItems.length} more
                            </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit min-w-37.5 p-3" align="start">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Other Values</p>
                                {remainingItems.map((item, index) => (
                                    <div key={index} className="text-sm font-medium border-b border-border pb-1 last:border-none">
                                        {item.value}
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
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

            return (
                <AttributeActions id={id} storeId={storeId}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for color ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </AttributeActions>
            );
        },
    },
];
