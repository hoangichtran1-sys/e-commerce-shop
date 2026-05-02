"use client";

import { useMemo } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";
import { orpc } from "@/orpc/orpc-rq.client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxSeparator,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { PlusCircleIcon, StoreIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const StoreSwitcher = () => {
    const { onOpen } = useStoreModal();
    const params = useParams();
    const router = useRouter();

    const { data, isLoading } = useQuery(orpc.stores.getMany.queryOptions());

    const formattedItems = useMemo(() => {
        return (data || []).map((item) => ({
            label: item.name,
            value: item.id,
        }));
    }, [data]);

    const currentStore = formattedItems.find(
        (item) => item.value === params.storeId,
    );

    if (isLoading || !currentStore) {
        return <Skeleton className="h-7 w-50" />;
    }

    return (
        <Combobox
            items={formattedItems}
            value={currentStore}
            onValueChange={(item) => {
                if (item?.value) {
                    router.push(`/admin/${item.value}`);
                }
            }}
            autoHighlight
        >
            <ComboboxInput
                className="w-50 min-w-50"
                placeholder="Select a store"
                showClear
            >
                <InputGroupAddon>
                    <StoreIcon className="size-4 mr-2" />
                </InputGroupAddon>
            </ComboboxInput>
            <ComboboxContent className="w-50 min-w-50">
                <ComboboxEmpty>
                    <span className="text-neutral-600 italic">
                        No stores found.
                    </span>
                </ComboboxEmpty>
                <ComboboxList>
                    {(item: { label: string; value: string }) => (
                        <ComboboxItem
                            key={item.value}
                            value={item}
                            className="mt-2"
                        >
                            <StoreIcon className="size-4 mr-2" />
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
                <ComboboxSeparator />
                <Button
                    onClick={() => onOpen()}
                    variant="ghost"
                    className="flex items-center justify-start w-full gap-2 px-2 py-1.5 hover:bg-neutral-100 text-sm"
                >
                    <PlusCircleIcon className="size-5" />
                    Create Store
                </Button>
            </ComboboxContent>
        </Combobox>
    );
};
