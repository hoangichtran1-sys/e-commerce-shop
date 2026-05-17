import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCartShopping } from '../shopping/use-cart-shopping';

export const useCart = (shoppingSlug: string) => {
    const addProduct = useCartShopping((state) => state.addProduct);
    const removeProduct = useCartShopping((state) => state.removeProduct);
    const clearCart = useCartShopping((state) => state.clearCart);
    const clearAllCarts = useCartShopping((state) => state.clearAllCarts);

    const productIds = useCartShopping(useShallow((state) => state.shoppingCarts[shoppingSlug]?.productIds || []));

    const toggleProduct = useCallback((productId: string) => {
        if (productIds.includes(productId)) {
            removeProduct(shoppingSlug, productId);
        } else {
            addProduct(shoppingSlug, productId);
        }
    }, [addProduct, productIds, removeProduct, shoppingSlug]);

    const isProductInCart = useCallback((productId: string) => {
        return productIds.includes(productId);
    }, [productIds]);

    const clearShoppingCart = useCallback(() => {
        clearCart(shoppingSlug);
    }, [clearCart, shoppingSlug]);

    const handleAddProduct = useCallback((productId: string) => {
        addProduct(shoppingSlug, productId);
    }, [addProduct, shoppingSlug]);

    const handleRemoveProduct = useCallback((productId: string) => {
        removeProduct(shoppingSlug, productId);
    }, [removeProduct, shoppingSlug]);

    return {
        productIds,
        addProduct: handleAddProduct,
        removeProduct: handleRemoveProduct,
        clearCart: clearShoppingCart,
        clearAllCarts,
        toggleProduct,
        isProductInCart,
        totalItems: productIds.length,
    };
};