/* eslint-disable @next/next/no-img-element */
import { SetupView } from "@/features/admin/stores/views/setup-view";
import { requireAdmin } from "@/lib/auth-utils";
import { client } from "@/lib/orpc";
import Image from "next/image";
import { redirect } from "next/navigation";

const Page = async () => {
    await requireAdmin();

    const stores = await client.stores.getMany()

    if (stores.length === 0) {
        return (
            <div className="h-full w-full">
                <Image
                    fill
                    src="/background.jpg"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 blur-sm"
                />
                <SetupView />
            </div>
        );
    }
    redirect(`/admin/${stores[0].id}`);
};

export default Page;
