"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BillboardGetMany } from "../types";
import { BillboardActions } from "./billboard-actions";
import { format } from "date-fns";
import { ToggleActive } from "./toggle-active";

export const columns: ColumnDef<BillboardGetMany[number]>[] = [
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
        accessorKey: "label",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Label
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const label = row.original.label;

            return <p className="line-clamp-1">{label}</p>;
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
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;
            const isActive = row.original.isActive;

            return <ToggleActive isChecked={isActive} id={id} storeId={storeId} />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.id;
            const storeId = row.original.storeId;

            return (
                <BillboardActions id={id} storeId={storeId}>
                    <Button
                        className="size-8 p-0"
                        variant="ghost"
                        aria-label={`Open actions for billboard ${id}`}
                    >
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </BillboardActions>
            );
        },
    },
];
