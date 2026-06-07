"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/features/customer/hooks/use-cart";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { CardDetails } from "./cart-details";
import { useConfettiStore } from "@/features/customer/hooks/use-confetti-store";
import { useCheckoutStates } from "@/features/customer/hooks/use-checkout-states";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useDiscountCoupon } from "@/features/customer/hooks/use-discount-coupon";
import { useRouter } from "next/navigation";

interface ShoppingCartProps {
    storeId: string;
    storeSlug: string;
    shippingFee: number;
    freeThreshold: number;
}

export const ShoppingCart = ({ storeId, storeSlug, shippingFee, freeThreshold }: ShoppingCartProps) => {
    const router = useRouter();
    const { variantItemsArray, clearCart } = useCart(storeSlug);

    const variantIds = variantItemsArray.map((variant) => variant.productVariantId);

    const { data, isPending } = useQuery({
        ...orpc.customer.getVariantsInCart.queryOptions({ input: { storeId, variantIds } }),
        placeholderData: keepPreviousData,
        refetchInterval: 30000,
    });

    const productCurrentIds = useMemo(() => {
        if (!data) return [];

        const uniqueIds = new Set<string>();
        data.forEach((item) => {
            uniqueIds.add(item.productId);
        });

        return Array.from(uniqueIds);
    }, [data]);

    const queryClient = useQueryClient();
    const [states, setStates] = useCheckoutStates();
    const { onOpenConfetti } = useConfettiStore();
    const { setDiscountOption } = useDiscountCoupon();

    useEffect(() => {
        if (states.success) {
            onOpenConfetti();
            clearCart();
            setDiscountOption(null);
            queryClient.invalidateQueries(orpc.customer.getVariantsInCart.queryOptions({ input: { storeId, variantIds } }));
            setStates({ success: false, cancel: false });
            setTimeout(() => {
                toast.success("Checkout completed", {
                    action: (
                        <Button className="ml-auto" size="xs" onClick={() => router.push(`/${storeSlug}/orders`)}>
                            View orders
                        </Button>
                    ),
                });
            }, 200);
        }
        if (states.cancel) {
            setDiscountOption(null);
            setStates({ success: false, cancel: false });
            setTimeout(() => {
                toast.error("Error!", {
                    description: "Checkout canceled. Please try again",
                    position: "top-right",
                });
            }, 200);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [states.success, states.cancel]);

    if (isPending) {
        return <p>Loading...</p>;
    }

    if (data && data.length === 0) {
        return (
            <Card className="border-0 ring-0 outline-none shadow-none mb-0 mt-12">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="text-muted-foreground/50 mb-4 size-12" />
                    <h3 className="text-lg font-medium">Your cart is empty</h3>
                    <p className="text-muted-foreground mt-1 text-sm">Add some items to get started</p>
                    <Button className="h-9 px-4 py-2 mt-4 cursor-pointer" variant="outline">
                        Continue Shopping
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <CardDetails
            items={data || []}
            storeSlug={storeSlug}
            storeId={storeId}
            shippingFee={shippingFee}
            freeThreshold={freeThreshold}
            productCurrentIds={productCurrentIds}
        />
    );
};
