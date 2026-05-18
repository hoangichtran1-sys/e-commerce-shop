import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCartShopping } from "../shopping/use-cart-shopping";
import type { ProductItem } from "../shopping/use-cart-shopping";

export const useCart = (shoppingSlug: string) => {
    const addToCard = useCartShopping((state) => state.addToCart);
    const setQuantity = useCartShopping((state) => state.setQuantity);
    const removeProduct = useCartShopping((state) => state.removeProduct);
    const clearCart = useCartShopping((state) => state.clearCart);
    const clearAllCarts = useCartShopping((state) => state.clearAllCarts);

    const productItems = useCartShopping(useShallow((state) => state.shoppingCarts[shoppingSlug]?.items || {}));

    const isProductInCart = useCallback(
        (productId: string) => {
            return !!productItems[productId];
        },
        [productItems],
    );

    const clearShoppingCart = useCallback(() => {
        clearCart(shoppingSlug);
    }, [clearCart, shoppingSlug]);

    const handleAddProduct = useCallback(
        (productItem: ProductItem) => {
            addToCard(shoppingSlug, productItem);
        },
        [addToCard, shoppingSlug],
    );

    const handleRemoveProduct = useCallback(
        (productId: string) => {
            removeProduct(shoppingSlug, productId);
        },
        [removeProduct, shoppingSlug],
    );

    const handleSetQuantity = useCallback(
        (productId: string, quantity: number) => {
            setQuantity(shoppingSlug, productId, quantity);
        },
        [setQuantity, shoppingSlug],
    );

    return {
        productItems,
        addToCard: handleAddProduct,
        setQuantity: handleSetQuantity,
        removeProduct: handleRemoveProduct,
        clearCart: clearShoppingCart,
        clearAllCarts,
        isProductInCart,
        totalItems: Object.keys(productItems).length,
        itemsArray: Object.values(productItems)
    };
};
