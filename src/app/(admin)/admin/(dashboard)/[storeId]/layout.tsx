import { requireAdmin } from "@/lib/auth-utils";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        storeId: string;
    }>;
}

const Layout = async ({ children }: LayoutProps) => {
    await requireAdmin();

    return <div className="">
        Navbar
        {children}
    </div>;
};

export default Layout;
