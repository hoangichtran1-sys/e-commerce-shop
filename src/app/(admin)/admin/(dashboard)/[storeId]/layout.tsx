import { Navbar } from "@/features/admin/dashboard/components/navbar";
import { requireAdmin } from "@/lib/auth-utils";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        storeId: string;
    }>;
}

const Layout = async ({ children }: LayoutProps) => {
    const session = await requireAdmin();

    return (
        <>
            <Navbar currentUser={session.user} />
            {children}
        </>
    );
};

export default Layout;
