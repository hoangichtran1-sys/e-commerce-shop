import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCartShopping } from "../shopping/use-cart-shopping";
import type { ProductVariantItem } from "../shopping/use-cart-shopping";

export const useCart = (shoppingSlug: string) => {
    const addToCart = useCartShopping((state) => state.addToCart);
    const setQuantity = useCartShopping((state) => state.setQuantity);
    const removeProduct = useCartShopping((state) => state.removeProduct);
    const clearCart = useCartShopping((state) => state.clearCart);
    const clearAllCarts = useCartShopping((state) => state.clearAllCarts);

    const productVariantItems = useCartShopping(useShallow((state) => state.shoppingCarts[shoppingSlug]?.items || {}));

    const isProductVariantInCart = useCallback(
        (productVariantId: string) => {
            return !!productVariantItems[productVariantId];
        },
        [productVariantItems],
    );

    const clearShoppingCart = useCallback(() => {
        clearCart(shoppingSlug);
    }, [clearCart, shoppingSlug]);

    const handleAddProductVariant = useCallback(
        (productVariantItem: ProductVariantItem) => {
            addToCart(shoppingSlug, productVariantItem);
        },
        [addToCart, shoppingSlug],
    );

    const handleRemoveProductVariant = useCallback(
        (productVariantId: string) => {
            removeProduct(shoppingSlug, productVariantId);
        },
        [removeProduct, shoppingSlug],
    );

    const handleSetQuantity = useCallback(
        (productVariantId: string, quantity: number) => {
            setQuantity(shoppingSlug, productVariantId, quantity);
        },
        [setQuantity, shoppingSlug],
    );

    return {
        productVariantItems,
        addToCart: handleAddProductVariant,
        setQuantityVariant: handleSetQuantity,
        removeProductVariant: handleRemoveProductVariant,
        clearCart: clearShoppingCart,
        clearAllCarts,
        isProductVariantInCart,
        totalVariantItems: Object.keys(productVariantItems).length,
        variantItemsArray: Object.values(productVariantItems),
    };
};
