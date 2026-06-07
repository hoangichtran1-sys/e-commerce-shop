/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Trash2,
    Minus,
    Plus,
    ShoppingBag,
    Package,
    Shield,
    CreditCard,
    GiftIcon,
    ZapIcon,
    ArrowLeftIcon,
    TagIcon,
    PartyPopperIcon,
    HeartIcon,
} from "lucide-react";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn, formatPrice, getErrorCode } from "@/lib/utils";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ProductsRelated } from "../products-related";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/features/customer/hooks/use-cart";
import { GetVariantsInCard } from "@/features/customer/types";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDiscountCoupon } from "@/features/customer/hooks/use-discount-coupon";
import { useCheckoutStates } from "@/features/customer/hooks/use-checkout-states";

interface CardDetailsProps {
    items: GetVariantsInCard;
    storeSlug: string;
    storeId: string;
    shippingFee: number;
    freeThreshold: number;
    productCurrentIds: string[];
}

const estimatedDelivery = ["2-4 business days", "3-5 business days", "1-3 business days"];

const formSchema = z.object({
    code: z
        .string()
        .trim()
        .uppercase()
        .min(3)
        .max(20)
        .regex(/^[A-Z0-9]+$/),
});

export const CardDetails = ({ items, storeSlug, storeId, shippingFee, freeThreshold, productCurrentIds }: CardDetailsProps) => {
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const [, setStates] = useCheckoutStates();

    const router = useRouter();

    const { discountOption, setDiscountOption } = useDiscountCoupon();

    const { setQuantityVariant, removeProductVariant, totalVariantItems, productVariantItems } = useCart(storeSlug);

    const itemsWithQuantity = items.map((item) => ({
        ...item,
        quantity: productVariantItems[item.variantId]?.quantity || 1,
    }));

    const subtotal = itemsWithQuantity.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const savings = itemsWithQuantity.reduce((sum, item) => sum + (item.price - item.finalPrice) * item.quantity, 0);
    const shipping = subtotal >= freeThreshold ? 0 : shippingFee;
    const discountCoupon = discountOption !== null ? discountOption.discount : 0;
    const total = subtotal + shipping - discountCoupon;

    const applyPromoCode = useMutation(
        orpc.customer.applyCouponCode.mutationOptions({
            onSuccess: (data) => {
                toast.success("Apply coupon code successfully");
                setDiscountOption({ discount: data.discount, couponId: data.couponId });
                form.reset();
            },
            onError: (error) => {
                const code = getErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    toast.error("Please log in to continue");
                    router.replace(`/login?redirect=/${storeSlug}/cart`);
                    return;
                }
                toast.error(error.message);
            },
        }),
    );

    const checkout = useMutation(
        orpc.customer.checkout.mutationOptions({
            onMutate: () => {
                setStates({ success: false, cancel: false });
            },
            onSuccess: (data) => {
                toast.success("Checkout session ready");
                // eslint-disable-next-line react-hooks/immutability
                window.location.href = data.url;
            },
            onError: (error) => {
                const code = getErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    toast.error("Please log in to continue");
                    router.replace(`/login?redirect=/${storeSlug}/cart`);
                    return;
                }
                toast.error(error.message);
            },
        }),
    );

    const form = useForm({
        defaultValues: {
            code: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: ({ value }) => {
            applyPromoCode.mutate({ storeId, subtotal, code: value.code });
        },
    });

    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="ghost" className="h-6 px-4 py-4 w-full max-w-40 mb-4">
                <ArrowLeftIcon />
                Continue Shopping
            </Button>
            <div className="flex flex-col gap-2 mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Shopping Cart</h1>
                <p className="text-muted-foreground">
                    {totalVariantItems} {totalVariantItems === 1 ? "item" : "items"} in your cart •{" "}
                    <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
                </p>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex-1 flex flex-col gap-6">
                    {/* Cart Items */}
                    {itemsWithQuantity.map((item, index) => {
                        const attribute = Object.entries(item.combination).map(([_, val]) => val);

                        return (
                            <Card
                                key={item.variantId}
                                className={cn("gap-0 overflow-hidden py-0", {
                                    "opacity-50": isRemoving === item.variantId,
                                })}
                            >
                                <div className="flex flex-col sm:flex-row">
                                    <div className="relative h-auto w-full sm:w-40">
                                        <Image
                                            width={100}
                                            height={100}
                                            src={item.image.url}
                                            alt={item.name}
                                            className="h-36 w-full object-cover object-center"
                                        />
                                    </div>

                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-foreground text-xl font-medium">{item.name}</h3>
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    {attribute.map((attr, index) => {
                                                        if (index === attribute.length - 1) {
                                                            return ` ${attr}`;
                                                        } else {
                                                            return ` ${attr} •`;
                                                        }
                                                    })}
                                                </p>
                                                {item.stock > 0 ? (
                                                    <p className="text-emerald-500 mt-1 text-xs">Only {item.stock} Items Left!</p>
                                                ) : (
                                                    <p className="text-rose-500 mt-1 text-xs">Out of Stock!</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    className="rounded-full"
                                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                >
                                                    <HeartIcon className={cn("size-3", isWishlisted && "fill-rose-500 text-rose-500")} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                                    onClick={() => {
                                                        removeProductVariant(item.variantId);
                                                        setIsRemoving(item.variantId);
                                                    }}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8 cursor-pointer"
                                                    onClick={() => setQuantityVariant(item.variantId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus />
                                                </Button>
                                                <span
                                                    className={cn("w-8 text-center text-sm font-medium", item.stock === 0 && "text-muted-foreground")}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8 cursor-pointer"
                                                    onClick={() => setQuantityVariant(item.variantId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <Plus />
                                                </Button>
                                            </div>

                                            <div className="text-end">
                                                <p className="text-lg font-semibold">{formatPrice(item.finalPrice * item.quantity)}</p>
                                                {item.price > item.finalPrice && (
                                                    <p className="text-muted-foreground text-xs line-through">{formatPrice(item.price)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <CardFooter className="bg-muted/20 border-t px-4 py-2!">
                                    <div className="text-muted-foreground flex items-center text-sm w-full">
                                        <Package className="me-2 size-4" />
                                        <span>Estimated delivery: {estimatedDelivery[index % estimatedDelivery.length]}</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="flex flex-col gap-4 w-full lg:w-96">
                    <Card className="border-dashed py-4">
                        <CardContent className="px-4">
                            <div className="flex flex-col items-start gap-y-2">
                                <div className="flex items-center gap-x-2">
                                    <PartyPopperIcon className="size-3.5" />
                                    {subtotal >= freeThreshold ? (
                                        <p className="font-medium text-xs">You&apos;ve got FREE shipping!</p>
                                    ) : (
                                        <p className="font-medium text-xs">Add {formatPrice(freeThreshold - subtotal)} more to get FREE shipping</p>
                                    )}
                                </div>
                                <Progress className="w-full" value={subtotal >= freeThreshold ? 100 : (subtotal / freeThreshold) * 100} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="sticky top-4 gap-0">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className={shipping === 0 ? "text-success" : ""}>
                                        {shipping === 0 ? "Free" : `${formatPrice(shipping)}`}
                                    </span>
                                </div>
                                {discountOption !== null && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Coupon</span>
                                        <span className="text-success">-{formatPrice(discountOption.discount)}</span>
                                    </div>
                                )}
                                {savings > 0 && (
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>You Save</span>
                                        <span>-{formatPrice(savings + discountCoupon)}</span>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-2" />

                            <div className="flex items-center justify-between text-base font-medium">
                                <span>Total</span>
                                <div className="text-end">
                                    <p className="text-xl font-bold">{formatPrice(total)}</p>
                                    <p className="text-muted-foreground text-xs">including VAT, if applicable</p>
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.handleSubmit();
                                }}
                            >
                                <FieldGroup>
                                    <form.Field
                                        name="code"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                                                        aria-invalid={isInvalid}
                                                        autoComplete="off"
                                                        className="max-h-9 mt-6 uppercase"
                                                        placeholder="Promo code"
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />
                                </FieldGroup>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-10 px-8 mt-4 w-full text-base font-medium"
                                    disabled={items.length === 0}
                                    type="submit"
                                >
                                    <TagIcon className="text-center" />
                                </Button>
                            </form>

                            <Button
                                onClick={() =>
                                    checkout.mutate({
                                        storeId,
                                        productVariantItems: Object.values(productVariantItems),
                                        couponId: discountOption ? discountOption.couponId : null,
                                    })
                                }
                                size="lg"
                                className="h-10 px-8 mt-4 w-full text-base font-medium"
                                disabled={items.length === 0}
                            >
                                <ShoppingBag />
                                Proceed to Checkout
                            </Button>

                            <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                                <CreditCard className="size-3.5" />
                                <span>Secure payment with SSL encryption</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed py-4">
                        <CardContent className="px-4">
                            <div className="flex items-center justify-start gap-3">
                                <div className="flex size-6 items-center justify-center rounded-full bg-secondary text-primary">
                                    <Shield className="size-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Secure Checkout</h4>
                                    <p className="text-muted-foreground mt-1 text-xs">Safe & encrypted payment</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed py-4">
                        <CardContent className="px-4">
                            <div className="flex items-center justify-start gap-3">
                                <div className="flex size-6 items-center justify-center rounded-full bg-secondary text-primary">
                                    <GiftIcon className="size-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Member Rewards</h4>
                                    <p className="text-muted-foreground mt-1 text-xs">Earn points with purchase</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center justify-start gap-3">
                                <div className="flex size-6 items-center justify-center rounded-full bg-secondary text-primary">
                                    <ZapIcon className="size-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Fast Delivery</h4>
                                    <p className="text-muted-foreground mt-1 text-xs">2-5 business days</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ProductsRelated storeId={storeId} categoryIds={items.map((item) => item.categoryId)} productCurrentIds={productCurrentIds} />
        </div>
    );
};
