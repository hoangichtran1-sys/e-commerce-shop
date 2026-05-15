/* eslint-disable react/no-children-prop */
"use client";

import type { LucideIcon } from "lucide-react";
import { Clock, MailIcon, MapPin, Phone } from "lucide-react";
import { Fragment } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import Link from "next/link";
import Image from "next/image";

type NewsletterData = {
    title?: string;
    description?: string;
};

type NewsletterFormProps = NewsletterData;

type FooterLink = {
    text: string;
    link: string;
};

type FooterLinksSectionData = {
    title: string;
    items: FooterLink[];
};

interface FooterLinksSectionProps {
    sections: FooterLinksSectionData[];
}

type SocialIcon = {
    title: string;
    src: string;
    className?: string;
};

type SocialLink = {
    link: string;
    icon: SocialIcon;
};

type ContactLink = {
    icon: LucideIcon;
    text: string;
    type: LinkTypes;
    link?: string;
};

type ContactLinks = {
    contactDetails: ContactLink[];
    socialMedia: SocialLink[];
};

interface ContactSectionProps {
    links: ContactLinks;
}

interface FooterProps {
    newsletter?: NewsletterData;
    footerLinks?: FooterLinksSectionData[];
    contactLinks?: ContactLinks;
    className?: string;
}

const LINK_TYPES = {
    NO_LINK: "NO_LINK",
    PHONE_LINK: "PHONE_LINK",
    EMAIL_LINK: "EMAIL_LINK",
};

type LinkTypes = keyof typeof LINK_TYPES;

const NEWSLETTER_DATA = {
    title: "Newsletter",
    description: "Join our newsletter to receive exclusive deals, tech tips, product launches, and early access to the latest electronics.",
};

const FOOTER_LINKS: FooterLinksSectionData[] = [
    {
        title: "Information",
        items: [
            {
                text: "Terms and Conditions",
                link: "#",
            },
            {
                text: "Privacy Policy",
                link: "#",
            },
            {
                text: "Warranty Policy",
                link: "#",
            },
            {
                text: "Terms of Service",
                link: "#",
            },
        ],
    },
    {
        title: "Collections",
        items: [
            {
                text: "New Arrivals",
                link: "#",
            },
            {
                text: "Best Sellers",
                link: "#",
            },
            {
                text: "Seasonal Edits",
                link: "#",
            },
            {
                text: "Wardrobe Essentials",
                link: "#",
            },
        ],
    },
];

const SOCIAL_ICONS = {
    facebook: {
        title: "Facebook",
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/facebook-icon.svg",
    },
    x: {
        title: "X",
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/x.svg",
        className: "dark:invert",
    },
    instagram: {
        title: "Instagram",
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/instagram-icon.svg",
    },
};

const CONTACT_LINKS: ContactLinks = {
    contactDetails: [
        {
            icon: MapPin,
            text: "support@store.com",
            link: "support@store.com",
            type: LINK_TYPES.EMAIL_LINK as LinkTypes,
        },
        {
            icon: Phone,
            text: "+12345678910",
            link: "+12345678910",
            type: LINK_TYPES.PHONE_LINK as LinkTypes,
        },
        {
            icon: Clock,
            text: "Monday - Friday, 9 am - 9 pm",
            type: LINK_TYPES.NO_LINK as LinkTypes,
        },
    ],
    socialMedia: [
        {
            icon: SOCIAL_ICONS.facebook,
            link: "#",
        },
        {
            icon: SOCIAL_ICONS.x,
            link: "#",
        },
        {
            icon: SOCIAL_ICONS.instagram,
            link: "#",
        },
    ],
};

export const StoreFooter = ({
    newsletter = NEWSLETTER_DATA,
    footerLinks = FOOTER_LINKS,
    contactLinks = CONTACT_LINKS,
    className,
}: FooterProps) => {
    return (
        <section className={cn("pt-8 pb-8 xl:pt-12", className)}>
            <div className="container space-y-10">
                <div className="grid grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <NewsletterSection {...newsletter} />
                    </div>
                    <FooterLinksSection sections={footerLinks} />
                    <ContactSection links={contactLinks} />
                </div>
                <div>
                    <div className="flex items-center justify-between gap-4 md:gap-12.5">
                        <Separator className="flex-1" />
                        <div className="basis-10 md:basis-10">
                            <Link href="/">
                                <Image width={30} height={30} loading="lazy" className="block size-10 dark:hidden" src="/logo.svg" alt="Logo" />
                                <Image width={30} height={30} loading="lazy" className="hidden size-10 dark:block" src="/logo.svg" alt="Logo" />
                            </Link>
                        </div>
                        <Separator className="flex-1" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-muted-foreground max-md:text-xs">Copyright © 2026 SelectStore, Inc. All rights reserved.</p>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Image
                                loading="lazy"
                                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/visa.svg"
                                alt="Visa"
                                className="h-6"
                                width={40}
                                height={24}
                            />
                            <Image
                                loading="lazy"
                                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/mastercard.svg"
                                alt="Mastercard"
                                className="h-6"
                                width={40}
                                height={24}
                            />
                            <Image
                                loading="lazy"
                                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/amex.svg"
                                alt="American Express"
                                className="h-6"
                                width={40}
                                height={24}
                            />
                            <Image
                                loading="lazy"
                                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/paypal.svg"
                                alt="PayPal"
                                className="h-6"
                                width={40}
                                height={24}
                            />
                        </div>
                        <Select defaultValue="english">
                            <SelectTrigger className="h-8 w-24 text-xs">
                                <SelectValue placeholder="Select a language..." />
                            </SelectTrigger>
                            <SelectContent align="end" position="item-aligned">
                                <SelectGroup>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="français">Français</SelectItem>
                                    <SelectItem value="arabic">Arabic</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </section>
    );
};

const newsletterFormSchema = z.object({
    email: z.email(),
});

const NewsletterSection = ({ title, description }: NewsletterFormProps) => {
    const form = useForm({
        defaultValues: {
            email: "",
        },
        validators: {
            onSubmit: newsletterFormSchema,
        },
        onSubmit: ({ value }) => {
            toast.success(`Send email ${value.email} successfully`);
        },
    });

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="font-serif text-3xl leading-none font-medium">{title}</h3>
                <p className="leading-normal font-light">{description}</p>
            </div>
            <form
                className="space-y-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
            >
                <form.Field
                    name="email"
                    children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                            <Field data-invalid={isInvalid}>
                                <InputGroup>
                                    <InputGroupInput
                                        type="email"
                                        placeholder="Enter your email"
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        autoComplete="off"
                                    />
                                    <InputGroupAddon>
                                        <MailIcon />
                                    </InputGroupAddon>
                                </InputGroup>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                />
                <Button className="w-full">Subscribe</Button>
            </form>
        </div>
    );
};

const FooterLinksSection = ({ sections }: FooterLinksSectionProps) => {
    return (
        <Fragment>
            {sections.map(({ title, items }) => (
                <div key={title}>
                    <h2 className="mb-6 text-sm leading-tight font-medium text-muted-foreground uppercase">{title}</h2>
                    <ul className="space-y-3">
                        {items.map(({ text, link }) => (
                            <li key={text}>
                                <a href={link} className="underline-offset-4 hover:underline">
                                    {text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </Fragment>
    );
};

const ContactSection = ({ links }: ContactSectionProps) => {
    const { socialMedia, contactDetails } = links;

    return (
        <div>
            <h2 className="mb-6 text-sm leading-tight font-medium text-muted-foreground uppercase">Contact</h2>
            <div className="space-y-6">
                <ul className="space-y-3">
                    {contactDetails.map((item) => (
                        <li className="flex items-center gap-3" key={crypto.randomUUID()}>
                            <item.icon className="size-4 shrink-0 basis-4" />
                            <div className="flex-1">
                                {item.type === LINK_TYPES.NO_LINK ? (
                                    <p>{item.text}</p>
                                ) : (
                                    <a
                                        href={LINK_TYPES.EMAIL_LINK ? `mailto:${item.link}` : `tel:${item.link}`}
                                        className="underline-offset-4 hover:underline"
                                    >
                                        {item.text}
                                    </a>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
                <ul className="flex flex-wrap gap-3">
                    {socialMedia.map(({ icon, link }) => (
                        <li key={crypto.randomUUID()}>
                            <Button size="icon-lg" variant="outline" asChild>
                                <a href={link}>
                                    <Image
                                        width={20}
                                        height={20}
                                        loading="lazy"
                                        className={cn("size-5", icon.className)}
                                        alt={icon.title}
                                        src={icon.src}
                                    />
                                </a>
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
