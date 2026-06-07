"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";

interface AttributesViewProps {
    storeId: string;
}

export const AttributesView = ({ storeId }: AttributesViewProps) => {
    const router = useRouter();

    const { data: attributes } = useSuspenseQuery(orpc.attributes.getMany.queryOptions({ input: { storeId } }));

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={`Attributes (${attributes.length})`} description="Manage attributes for your store" />
                <Button onClick={() => router.push(`/admin/${storeId}/attributes/new`)}>
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable topic="attribute" data={attributes} columns={columns} searchKey="name" />
        </>
    );
};
