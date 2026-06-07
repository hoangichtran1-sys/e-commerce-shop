import { create } from "zustand";

type DiscountOption = {
    discount: number;
    couponId: string;
};

type DiscountCouponState = {
    discountOption: DiscountOption | null;
    setDiscountOption: (value: DiscountOption | null) => void;
};

export const useDiscountCoupon = create<DiscountCouponState>((set) => ({
    discountOption: null,
    setDiscountOption: (value: DiscountOption | null) => set({ discountOption: value }),
}));
