"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadGetAll } from "../types";
import { UploadActions } from "./upload-actions";
import { format } from "date-fns";
import { SupportIcon } from "@/components/support-icon";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { bytesToKB, capitalizeFirst } from "@/lib/utils";

export const columns: ColumnDef<UploadGetAll[number]>[] = [
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
        accessorKey: "image",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Image
                    <ArrowUpDownIcon className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const url = row.original.url;
            const publicId = row.original.publicId;

            return <Image width={30} height={30} alt={publicId} src={url} className="h-15 w-15 rounded-md object-cover" />;
        },
    },
    {
        id: "status",
        accessorFn: (row) => row.refType,
        header: "Reference Type",
        cell: ({ row }) => {
            const refType = row.original.refType;

            return <Badge variant={refType}>{capitalizeFirst(refType)}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "mimetype",
        header: "Mime Type",
        cell: ({ row }) => {
            const mimeType = row.original.mimetype;

            if (!mimeType) {
                return <p className="text-muted-foreground italic">N/A</p>;
            }

            return <Badge variant="outline">{mimeType}</Badge>;
        },
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => {
            const size = row.original.size;

            if (!size) {
                return <p className="text-muted-foreground italic">N/A</p>;
            }

            return <p className="font-semibold text-sm text-black">{bytesToKB(size)} KB</p>;
        },
    },
    {
        accessorKey: "isLinked",
        header: () => <div className="text-center w-[50%]">Link Status</div>,
        cell: ({ row }) => {
            const isLinked = row.original.isLinked;

            return (
                <div className="w-[50%]">
                    <span className="sr-only">{isLinked ? "Linked" : "Not Link"}</span>
                    <SupportIcon supported={isLinked} />
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
            const url = row.original.url;

            return (
                <UploadActions id={id} imageUrl={url}>
                    <Button className="size-8 p-0" variant="ghost" aria-label={`Open actions for billboard ${id}`}>
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                </UploadActions>
            );
        },
    },
];
