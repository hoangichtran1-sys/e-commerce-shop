/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/orpc-rq.client";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Mail, MailIcon, MapPin, Phone } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { toast } from "sonner";
import { z } from "zod";

const contactFormSchema = z.object({
    firstName: z.string().min(1).max(30),
    lastName: z.string().min(1).max(30),
    email: z.email(),
    subject: z.string().min(1).max(50),
    message: z.string().min(3).max(1000),
});

export const StoreContact = ({ className }: { className?: string }) => {
    const contact = useMutation(
        orpc.customer.contact.mutationOptions({
            onSuccess: () => {
                toast.success("The support request has been submitted.");
            },
            onError: () => {
                toast.error("Something went wrong");
            },
        }),
    );
    const form = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            subject: "",
            message: "",
        },
        validators: {
            onSubmit: contactFormSchema,
        },
        onSubmit: ({ value }) => {
            contact.mutate(value);
        },
    });

    const message = useStore(form.store, (state) => state.values.message);

    return (
        <section className={cn("py-16", className)}>
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">Get in Touch</h2>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        Have a question or want to work together? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as
                        possible.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                    {/* Contact Form */}
                    <Card className="h-full py-6">
                        <CardHeader className="px-6">
                            <CardTitle className="text-balance">Send us a Message</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6 px-6">
                            <form
                                className="space-y-6"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.handleSubmit();
                                }}
                            >
                                <FieldGroup>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <form.Field
                                            name="firstName"
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                                                        <Input
                                                            type="text"
                                                            placeholder="John"
                                                            id={field.name}
                                                            name={field.name}
                                                            value={field.state.value}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            aria-invalid={isInvalid}
                                                            autoComplete="off"
                                                        />

                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                        <form.Field
                                            name="lastName"
                                            children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                                                        <Input
                                                            type="text"
                                                            placeholder="Doe"
                                                            id={field.name}
                                                            name={field.name}
                                                            value={field.state.value}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            aria-invalid={isInvalid}
                                                            autoComplete="off"
                                                        />

                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>
                                </FieldGroup>
                                <FieldGroup>
                                    <form.Field
                                        name="email"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                                    <Input
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        autoComplete="off"
                                                    />

                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />
                                </FieldGroup>
                                <FieldGroup>
                                    <form.Field
                                        name="subject"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Subject</FieldLabel>
                                                    <Input
                                                        type="text"
                                                        placeholder="How can we help?"
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        autoComplete="off"
                                                    />

                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />
                                </FieldGroup>
                                <FieldGroup>
                                    <form.Field
                                        name="message"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                                                    <InputGroup>
                                                        <InputGroupTextarea
                                                            className="min-h-30"
                                                            id={field.name}
                                                            name={field.name}
                                                            value={field.state.value || ""}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            onBlur={field.handleBlur}
                                                            placeholder="Tell us more about your product..."
                                                            aria-invalid={isInvalid}
                                                        />
                                                        <InputGroupAddon align="block-end">
                                                            <InputGroupText>{message ? message.trim().length : 0}/1000</InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />
                                </FieldGroup>

                                <Button className="h-9 px-4 py-2 w-full cursor-pointer">
                                    <MailIcon className="size-4 text-white" />
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Contact Information & Additional Info */}
                    <div className="flex h-full flex-col gap-6">
                        {/* Contact Information */}
                        <Card className="flex-1 gap-3 py-6">
                            <CardHeader className="px-6">
                                <CardTitle className="text-lg text-balance">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
                                        <Mail className="text-primary size-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">Email</h4>
                                        <p className="text-muted-foreground text-xs">support@ecommerce.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
                                        <Phone className="text-primary size-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">Phone</h4>
                                        <p className="text-muted-foreground text-xs">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-primary/10 mt-0.5 flex size-8 items-center justify-center rounded-full">
                                        <MapPin className="text-primary size-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">Office</h4>
                                        <p className="text-muted-foreground text-xs">
                                            123 Business Ave, Suite 100
                                            <br />
                                            San Francisco, CA 94105
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Hours */}
                        <Card className="gap-3 py-6">
                            <CardHeader className="px-6">
                                <CardTitle className="text-lg text-balance">Business Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6">
                                <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span className="text-muted-foreground">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="text-muted-foreground">Closed</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Alternative Contact */}
                        <Card className="gap-3 py-6">
                            <CardHeader className="px-6">
                                <CardTitle className="text-lg text-balance">Prefer to Call?</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6">
                                <p className="text-muted-foreground mb-3 text-sm">Speak directly with our team for immediate assistance.</p>
                                <Button
                                    onClick={() => toast.info("You call to your system...")}
                                    variant="outline"
                                    className="h-9 px-4 py-2 w-full cursor-pointer"
                                >
                                    <Phone />
                                    Schedule a Call
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};
