/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <img
                src="/background.jpg"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover opacity-90 blur-sm"
            />
            <div className="flex w-full max-w-sm flex-col gap-6 z-10">
                <Link
                    href="/"
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <Image
                        src="/logo.svg"
                        alt="E-commerce"
                        width={30}
                        height={30}
                    />
                </Link>
                {children}
            </div>
        </div>
    );
};
