import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            await (await req.blob()).text(),
            req.headers.get("stripe-signature") as string,
            env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (error! instanceof Error) {
            console.log(error);
        }
        console.log(`Webhook error: ${errorMessage}`);
        return NextResponse.json({ message: `Webhook error: ${errorMessage}` }, { status: 400 });
    }

    console.log("Success:", event.id);

    const permittedEvents: string[] = ["checkout.session.completed", "payment_intent.payment_failed", "refund.created"];

    if (permittedEvents.includes(event.type)) {
        let data;

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    data = event.data.object as Stripe.Checkout.Session;

                    const transactionId = data.payment_intent as string;
                    const amountPaid = data.amount_total ? data.amount_total / 100 : null;

                    const address = data?.customer_details?.address;
                    const customerEmail = data?.customer_details?.email;
                    const customerName = data?.customer_details?.name;
                    const phone = data?.customer_details?.phone || "";

                    const addressComponents = [address?.line1, address?.line2, address?.city, address?.state, address?.postal_code, address?.country];

                    const addressString = addressComponents.filter((item) => item !== null).join(", ");

                    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId, {
                        expand: ["latest_charge"],
                    });

                    const charge = paymentIntent.latest_charge as Stripe.Charge;
                    const receiptUrl = charge.receipt_url;

                    const orderId = data.metadata?.orderId;

                    if (!orderId) {
                        throw new Error("Order ID is required");
                    }

                    await prisma.$transaction(async (tx) => {
                        const order = await tx.order.findUnique({
                            where: {
                                id: orderId,
                            },
                            include: {
                                orderItems: {
                                    include: {
                                        productVariant: true,
                                    },
                                },
                            },
                        });

                        if (!order || order.status === "PAID") {
                            return;
                        }

                        await tx.order.update({
                            where: {
                                id: orderId,
                            },
                            data: {
                                status: "PAID",
                                address: addressString,
                                transactionId: paymentIntent.id,
                                email: customerEmail,
                                name: customerName,
                                amountPaid,
                                receiptUrl,
                                country: address?.country,
                                phone,
                            },
                        });
                        if (order.couponId) {
                            await tx.coupon.update({
                                where: {
                                    id: order.couponId,
                                },
                                data: {
                                    usedCount: {
                                        increment: 1,
                                    },
                                },
                            });
                        }

                        const productVariantItems = order.orderItems.map((item) => ({
                            variantId: item.productVariantId,
                            quantity: item.quantity,
                            productId: item.productVariant.productId,
                        }));

                        const soldMap = new Map<string, number>();

                        for (const item of productVariantItems) {
                            const updated = await tx.productVariant.updateMany({
                                where: {
                                    id: item.variantId,
                                    stock: {
                                        gte: item.quantity,
                                    },
                                },
                                data: {
                                    stock: {
                                        decrement: item.quantity,
                                    },
                                },
                            });

                            if (updated.count === 0) {
                                throw new Error("Out of stock");
                            }

                            soldMap.set(item.productId, (soldMap.get(item.productId) || 0) + item.quantity);
                        }

                        for (const [productId, quantity] of soldMap) {
                            await tx.product.update({
                                where: {
                                    id: productId,
                                },
                                data: {
                                    soldCount: {
                                        increment: quantity,
                                    },
                                },
                            });
                        }
                    });

                    break;
                }
                case "payment_intent.payment_failed": {
                    data = event.data.object as Stripe.PaymentIntent;

                    const orderId = data.metadata?.orderId;

                    if (!orderId) {
                        throw new Error("Order ID is required");
                    }

                    await prisma.$transaction(async (tx) => {
                        const order = await tx.order.findUnique({
                            where: {
                                id: orderId,
                            },
                        });

                        if (!order || order.status === "CANCELLED") {
                            return;
                        }

                        await tx.order.update({
                            where: {
                                id: orderId,
                            },
                            data: {
                                status: "CANCELLED",
                            },
                        });
                    });

                    break;
                }
                case "refund.created": {
                    data = event.data.object as Stripe.Refund;
                    const paymentIntentId = data.payment_intent;

                    if (!paymentIntentId) {
                        throw new Error("Payment intent ID is required");
                    }

                    await prisma.$transaction(async (tx) => {
                        const order = await tx.order.findUnique({
                            where: {
                                transactionId: paymentIntentId as string,
                            },
                        });

                        if (!order || order.status === "REFUND") {
                            return;
                        }

                        await tx.order.update({
                            where: {
                                id: order.id,
                            },
                            data: {
                                status: "REFUND",
                            },
                        });
                    });

                    break;
                }
                default:
                    console.log("Unhandled event type: " + event.type);
                    break;
            }
        } catch (error) {
            console.log(error);
            return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Received" }, { status: 200 });
};
