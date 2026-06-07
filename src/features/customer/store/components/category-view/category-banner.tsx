import { Promotion } from "@/generated/prisma/client";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Tag } from "lucide-react";

interface CategoryBannerProps {
    promotion: Promotion;
}

export const CategoryBanner = ({ promotion }: CategoryBannerProps) => {
    return (
        <div className="w-full mb-3">
            <div className="
                flex items-center justify-between
                rounded-2xl border border-orange-200
                bg-gradient-to-r from-orange-50 to-white
                px-5 py-4
                shadow-sm
                hover:shadow-md
                transition-all
            ">
                {/* LEFT */}
                <div className="flex items-start gap-3">
                    <div className="
                        flex h-11 w-11 items-center justify-center
                        rounded-xl bg-orange-100 text-orange-600
                    ">
                        <Tag size={20} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-base">
                            {promotion.name}
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                            {format(promotion.startAt, "dd/MM/yyyy")} -{" "}
                            {format(promotion.endAt, "dd/MM/yyyy")}
                        </p>

                        {promotion.maxDiscountValue && (
                            <p className="text-sm mt-1">
                                Maximum reduction:{" "}
                                <span className="font-semibold text-foreground">
                                    {formatPrice(promotion.maxDiscountValue)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                    <div className="
                        inline-flex items-center rounded-full
                        bg-orange-500 px-4 py-2
                        text-white font-bold text-lg
                        shadow-sm
                    ">
                        -{promotion.value}%
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                        Promotion applied
                    </p>
                </div>
            </div>
        </div>
    );
};
