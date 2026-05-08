"use client";

import { DataTable } from "@/components/data-table";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarIcon, PlayIcon, PlusIcon, StopCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";

interface PromotionsViewProps {
    storeId: string;
}

export const PromotionsView = ({ storeId }: PromotionsViewProps) => {
    const router = useRouter();

    const { data: promotions } = useSuspenseQuery(
        orpc.promotions.getManyByStore.queryOptions({ input: { storeId } }),
    );

    const statusOption = [
        { label: "Running", value: "running", icon: PlayIcon },
        { label: "Upcoming", value: "upcoming", icon: CalendarIcon },
        { label: "Expired", value: "expired", icon: StopCircleIcon },
    ];

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Promotions (${promotions.length})`}
                    description="Manage promotions for your store"
                />
                <Button
                    onClick={() =>
                        router.push(`/admin/${storeId}/promotions/new`)
                    }
                >
                    <PlusIcon className="size-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable
                data={promotions}
                columns={columns}
                searchKey="name"
                statusOption={statusOption}
            />
        </>
    );
};
