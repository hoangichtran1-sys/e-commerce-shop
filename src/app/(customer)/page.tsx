import { StoreContact } from "@/features/customer/start/components/store-contact";
import { StoreFaq } from "@/features/customer/start/components/store-faq";
import { StoreFooter } from "@/features/customer/start/components/store-footer";
import { StorePicker } from "@/features/customer/start/components/store-picker";
import { StoreTestimonial } from "@/features/customer/start/components/store-testimonial";
import { HydrateClient, orpc, prefetch } from "@/orpc/orpc-rq.server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
    const cookieStore = await cookies();
    const saved = cookieStore.get("storeSlug");

    if (saved) {
        redirect(`/${saved.value}`);
    }

    await prefetch(orpc.customer.getStores.queryOptions());

    return (
        <>
            <HydrateClient>
                <Suspense fallback={<p>Loading...</p>}>
                    <ErrorBoundary fallback={<p>Error!</p>}>
                        <StorePicker />
                    </ErrorBoundary>
                </Suspense>
            </HydrateClient>
            <StoreTestimonial />
            <StoreFaq />
            <StoreContact />
            <StoreFooter className="p-12" />
        </>
    );
};

export default Page;
