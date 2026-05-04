"use client";

import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface StoreViewProp {
    storeId: string;
}

export const StoreView = ({ storeId }: StoreViewProp) => {
    const { data: store } = useSuspenseQuery(
        orpc.stores.getOne.queryOptions({ input: { id: storeId } }),
    );

    return (
        <div className="p-10 flex items-center">
            <pre>{JSON.stringify(store, null, 2)}</pre>
        </div>
    );
};
