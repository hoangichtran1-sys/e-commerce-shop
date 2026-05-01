"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface BillboardViewProps {
    storeId: string;
}

export const BillboardView = ({ storeId }: BillboardViewProps) => {
    const router = useRouter();
    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title="Billboards (0)"
                    description="Manage billboards for your store"
                />
                <Button
                    onClick={() =>
                        router.push(`/admin/${storeId}/billboards/new`)
                    }
                >
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
        </>
    );
};
