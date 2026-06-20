import { ErrorView } from "@/components/error-view";
import { loaderStoreSearchParams } from "@/features/customer/params";
import { StoreContact } from "@/features/customer/start/components/store-contact";
import { StoreFaq } from "@/features/customer/start/components/store-faq";
import { StoreFooter } from "@/features/customer/start/components/store-footer";
import { StorePicker } from "@/features/customer/start/components/store-picker";
import { StoreTestimonial } from "@/features/customer/start/components/store-testimonial";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: PageProps) => {
    const cookieStore = await cookies();
    const saved = cookieStore.get("storeSlug");

    if (saved) {
        redirect(`/${saved.value}`);
    }

    const storeSearchParams = await loaderStoreSearchParams(searchParams);

    await prefetch(orpc.customer.getStores.queryOptions({ input: { search: storeSearchParams.search } }));

    return (
        <>
            <HydrateClient>
                <ErrorBoundary fallback={<ErrorView message="Error!" />}>
                    <StorePicker />
                </ErrorBoundary>
            </HydrateClient>
            <StoreTestimonial />
            <StoreFaq />
            <StoreContact />
            <StoreFooter className="p-12" />
        </>
    );
};

export default Page;
