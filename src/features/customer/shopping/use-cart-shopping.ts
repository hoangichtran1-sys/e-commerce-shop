import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ProductItem = {
    productId: string;
    quantity: number;
}

interface ShoppingCart {
    productIds: string[];
}

interface CartState {
    shoppingCarts: Record<string, ShoppingCart>;
    addProduct: (shoppingSlug: string, productId: string) => void;
    removeProduct: (shoppingSlug: string, productId: string) => void;
    clearCart: (shoppingSlug: string) => void;
    clearAllCarts: () => void;
}

export const useCartShopping = create<CartState>()(
    persist(
        (set) => ({
            shoppingCarts: {},
            addProduct: (shoppingSlug, productId) =>
                set((state) => ({
                    shoppingCarts: {
                        ...state.shoppingCarts,
                        [shoppingSlug]: {
                            productIds: [
                                ...(state.shoppingCarts[shoppingSlug]?.productIds ||
                                    []),
                                productId,
                            ],
                        },
                    },
                })),
            removeProduct: (shoppingSlug, productId) =>
                set((state) => ({
                    shoppingCarts: {
                        ...state.shoppingCarts,
                        [shoppingSlug]: {
                            productIds:
                                state.shoppingCarts[
                                    shoppingSlug
                                ]?.productIds.filter(
                                    (id) => id !== productId,
                                ) || [],
                        },
                    },
                })),
            clearCart: (shoppingSlug) =>
                set((state) => ({
                    shoppingCarts: {
                        ...state.shoppingCarts,
                        [shoppingSlug]: {
                            productIds: [],
                        },
                    },
                })),
            clearAllCarts: () =>
                set({
                    shoppingCarts: {},
                }),
        }),
        {
            name: "shopping-cart",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);