/* eslint-disable @next/next/no-img-element */
import { getStores } from "@/actions/queries";
import { SetupView } from "@/features/admin/stores/views/setup-view";
import { requireAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

const Page = async () => {
    const session = await requireAdmin();

    const stores = await getStores(session.user.id);

    if (stores.length === 0) {
        return (
            <div className="h-full w-full">
                <img
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
