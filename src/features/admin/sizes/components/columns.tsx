"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { SizesGetManyByStore } from "../types";
import { SizeActions } from "./size-actions";

export const columns: ColumnDef<SizesGetManyByStore[number]>[] = [
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
        accessorKey: "value",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Value
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const value = row.original.value;

            return <p className="line-clamp-1">{value}</p>;
        },
    },
    {
        id: "category",
        accessorFn: (row) => row.category.name,
        header: "Category",
        cell: ({ row }) => {
            const categoryName = row.original.category.name;

            return <p className="line-clamp-1">{categoryName}</p>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
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
                <SizeActions id={id} storeId={storeId}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for sizes ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </SizeActions>
            );
        },
    },
];
