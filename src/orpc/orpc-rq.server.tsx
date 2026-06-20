import "server-only";

import { cache } from "react";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import { dehydrate, HydrationBoundary, type FetchQueryOptions, type FetchInfiniteQueryOptions, QueryKey } from "@tanstack/react-query";

import { client } from "@/lib/orpc";
import { makeQueryClient } from "@/lib/query-client";

export const getQueryClient = cache(makeQueryClient);

export const orpc = createORPCReactQueryUtils(client);

export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}

export function prefetch(queryOptions: FetchQueryOptions) {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(queryOptions);
}

export function prefetchInfinite<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TPageParam = any,
>(queryOptions: FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>) {
    const queryClient = getQueryClient();
    return queryClient.prefetchInfiniteQuery(queryOptions);
}
