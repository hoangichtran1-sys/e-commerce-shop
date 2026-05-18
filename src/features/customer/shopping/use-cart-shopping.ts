import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ProductItem = {
    productId: string;
    quantity: number;
};

interface ShoppingCart {
    items: Record<string, ProductItem>;
}

interface CartState {
    shoppingCarts: Record<string, ShoppingCart>;
    addToCart: (shoppingSlug: string, item: ProductItem) => void;
    setQuantity: (shoppingSlug: string, productId: string, quantity: number) => void;
    removeProduct: (shoppingSlug: string, productId: string) => void;
    clearCart: (shoppingSlug: string) => void;
    clearAllCarts: () => void;
}

export const useCartShopping = create<CartState>()(
    persist(
        (set) => ({
            shoppingCarts: {},
            addToCart: (shoppingSlug, item) =>
                set((state) => {
                    const cart = state.shoppingCarts[shoppingSlug]?.items || {};

                    const existing = cart[item.productId];

                    return {
                        ...state.shoppingCarts,
                        [shoppingSlug]: {
                            items: {
                                ...cart,
                                [item.productId]: {
                                    productId: item.productId,
                                    quantity: (existing?.quantity || 0) + item.quantity,
                                },
                            },
                        },
                    };
                }),
            setQuantity: (shoppingSlug, productId, quantity) =>
                set((state) => {
                    const cart = state.shoppingCarts[shoppingSlug]?.items || {};

                    if (!cart[productId]) return state;

                    return {
                        shoppingCarts: {
                            ...state.shoppingCarts,
                            [shoppingSlug]: {
                                items: {
                                    [productId]: {
                                        ...cart[productId],
                                        quantity,
                                    },
                                },
                            },
                        },
                    };
                }),
            removeProduct: (shoppingSlug, productId) =>
                set((state) => {
                    const cart = state.shoppingCarts[shoppingSlug]?.items || {};

                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [productId]: _, ...rest } = cart;

                    return {
                        ...state.shoppingCarts,
                        [shoppingSlug]: {
                            items: rest,
                        },
                    };
                }),
            clearCart: (shoppingSlug) =>
                set((state) => ({
                    shoppingCarts: {
                        ...state.shoppingCarts,
                        [shoppingSlug]: {
                            items: {},
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
