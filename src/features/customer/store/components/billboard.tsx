import { FALLBACK_IMAGE } from "@/constants";
import type { Billboard as BillboardType } from "@/generated/prisma/client";

interface BillboardProps {
    data: BillboardType | null;
}

export const Billboard = ({ data }: BillboardProps) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
            <div
                className="rounded-xl relative aspect-3/1 md:aspect-4/1 overflow-hidden bg-cover"
                style={{
                    backgroundImage: `url(${data ? data.imageUrl : FALLBACK_IMAGE})`,
                }}
            >
                <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8">
                    <div className="font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-xs">{data?.label || "No content"}</div>
                </div>
            </div>
        </div>
    );
};
