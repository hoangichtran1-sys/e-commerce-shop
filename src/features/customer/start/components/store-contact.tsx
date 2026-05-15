"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Mail, MapPin, Phone } from "lucide-react";

export const StoreContact = ({ className }: { className?: string }) => {
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
                            <FieldGroup>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="first-name-aB3x9">First name</FieldLabel>
                                        <Input id="first-name-aB3x9" placeholder="John" className="h-9" />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="last-name-cD4y8">Last name</FieldLabel>
                                        <Input id="last-name-cD4y8" placeholder="Doe" className="h-9" />
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="email-eF5z7">Email</FieldLabel>
                                    <Input id="email-eF5z7" type="email" placeholder="john@example.com" className="h-9" />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="subject-gH6w6">Subject</FieldLabel>
                                    <Input id="subject-gH6w6" placeholder="How can we help?" className="h-9" />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="message-iJ7v5">Message</FieldLabel>
                                    <Textarea id="message-iJ7v5" placeholder="Tell us more about your project..." className="min-h-30" />
                                </Field>
                            </FieldGroup>
                            <Button className="h-9 px-4 py-2 w-full cursor-pointer">Send Message</Button>
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
                                        <p className="text-muted-foreground text-xs">hello@company.com</p>
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
                                <Button variant="outline" className="h-9 px-4 py-2 w-full cursor-pointer">
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
