import { Navbar } from "@/features/admin/dashboard/components/navbar";
import { requireAdmin } from "@/lib/auth-utils";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        storeId: string;
    }>;
}

const Layout = async ({ children }: LayoutProps) => {
    await requireAdmin();

    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default Layout;
