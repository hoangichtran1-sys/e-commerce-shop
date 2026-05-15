/* eslint-disable react/no-children-prop */
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { safeRedirect } from "@/lib/utils";

const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirect = safeRedirect(searchParams.get("redirect"));

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onSubmit: loginSchema,
        },
        onSubmit: async ({ value }) => {
            await authClient.signIn.email(
                {
                    email: value.email,
                    password: value.password,
                    callbackURL: redirect,
                },
                {
                    onSuccess: () => {
                        router.push(redirect);
                        toast.success("Login successfully");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                    },
                },
            );
        },
    });

    const onSocial = (provider: "google" | "facebook") => {
        authClient.signIn.social(
            {
                provider: provider,
                callbackURL: redirect,
            },
            {
                onSuccess: () => {
                    toast.success(`Login with ${provider} successfully`);
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                },
            },
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Login to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <Button className="w-full" variant="outline" type="button" onClick={() => onSocial("google")}>
                                    <FcGoogle />
                                    Continue with Google
                                </Button>
                                <Button className="w-full" variant="outline" type="button" onClick={() => onSocial("facebook")}>
                                    <FaFacebookF className="text-blue-500" />
                                    Continue with Facebook
                                </Button>
                            </div>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>
                            <div className="grid gap-6">
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
                                                        placeholder="e.g. test@gmail.com"
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
                                        name="password"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                    <Input
                                                        type="password"
                                                        placeholder="*********"
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
                                <Button type="submit" className="w-full">
                                    Login
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/sign-up" className="underline underline-offset-4">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
