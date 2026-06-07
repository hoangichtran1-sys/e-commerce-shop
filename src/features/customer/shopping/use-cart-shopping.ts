import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ProductVariantItem = {
    productVariantId: string;
    quantity: number;
};

interface ShoppingCart {
    items: Record<string, ProductVariantItem>;
}

interface CartState {
    shoppingCarts: Record<string, ShoppingCart>;
    addToCart: (shoppingSlug: string, item: ProductVariantItem) => void;
    setQuantity: (shoppingSlug: string, productVariantId: string, quantity: number) => void;
    removeProduct: (shoppingSlug: string, productVariantId: string) => void;
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

                    const existing = cart[item.productVariantId];

                    return {
                        shoppingCarts: {
                            ...state.shoppingCarts,
                            [shoppingSlug]: {
                                items: {
                                    ...cart,
                                    [item.productVariantId]: {
                                        productVariantId: item.productVariantId,
                                        quantity: (existing?.quantity || 0) + item.quantity,
                                    },
                                },
                            },
                        },
                    };
                }),
            setQuantity: (shoppingSlug, productVariantId, quantity) =>
                set((state) => {
                    const cart = state.shoppingCarts[shoppingSlug]?.items || {};

                    if (!cart[productVariantId]) return state;

                    return {
                        shoppingCarts: {
                            ...state.shoppingCarts,
                            [shoppingSlug]: {
                                items: {
                                    ...cart,
                                    [productVariantId]: {
                                        ...cart[productVariantId],
                                        quantity,
                                    },
                                },
                            },
                        },
                    };
                }),
            removeProduct: (shoppingSlug, productVariantId) =>
                set((state) => {
                    const cart = state.shoppingCarts[shoppingSlug]?.items || {};

                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [productVariantId]: _, ...rest } = cart;

                    return {
                        shoppingCarts: {
                            ...state.shoppingCarts,
                            [shoppingSlug]: {
                                items: rest,
                            },
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
