"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Lock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { resetPasswordSchema } from "@/lib/validations/auth";

function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isExpiredOrInvalid, setIsExpiredOrInvalid] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Next.js useSearchParams automatically URL-decodes the value
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new password reset link.");
            setIsExpiredOrInvalid(true);
        }
    }, [token]);

    const onSubmit = async (data) => {
        if (!token) return;

        setIsLoading(true);
        setError("");
        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                const msg = result.message || "Failed to reset password. The link may have expired.";
                // Detect token-related errors so we can show the "Request new link" CTA
                const isTokenError =
                    msg.toLowerCase().includes("expired") ||
                    msg.toLowerCase().includes("invalid") ||
                    msg.toLowerCase().includes("already been used") ||
                    response.status === 400;
                if (isTokenError) {
                    setIsExpiredOrInvalid(true);
                }
                throw new Error(msg);
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err) {
            console.error("Reset password error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Success State ────────────────────────────────────────────────────────
    if (isSuccess) {
        return (
            <Card className="shadow-lg border-neutral-200/60">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-green-50 text-green-600 rounded-full">
                            <CheckCircle2 className="size-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
                    <CardDescription>
                        Your password has been updated. Redirecting you to the login page&hellip;
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button asChild className="w-full h-11">
                        <Link href="/login">Go to Login Now</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // ── Invalid / Expired Token State ────────────────────────────────────────
    if (isExpiredOrInvalid && !isLoading) {
        return (
            <Card className="shadow-lg border-neutral-200/60">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                            <AlertCircle className="size-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Link Invalid or Expired</CardTitle>
                    <CardDescription>
                        {error || "This password reset link is no longer valid. It may have already been used or has expired (links expire after 1 hour)."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button asChild className="w-full h-11">
                        <Link href="/forgot-password">Request a New Reset Link</Link>
                    </Button>
                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                        >
                            <ArrowLeft className="size-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ── Main Form ────────────────────────────────────────────────────────────
    return (
        <Card className="shadow-lg border-neutral-200/60">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                        <KeyRound className="size-6" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
                <CardDescription>
                    Choose a strong new password for your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && !isExpiredOrInvalid && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg font-medium text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="password" icon={Lock}>New Password</FieldLabel>
                            <Input
                                {...register("password")}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-muted/30 focus-visible:bg-white transition-colors"
                                disabled={!token || isLoading}
                                autoComplete="new-password"
                            />
                            {errors.password && (
                                <FieldDescription className="text-destructive font-medium mt-1">
                                    {errors.password.message}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="confirmPassword" icon={Lock}>Confirm Password</FieldLabel>
                            <Input
                                {...register("confirmPassword")}
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="bg-muted/30 focus-visible:bg-white transition-colors"
                                disabled={!token || isLoading}
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && (
                                <FieldDescription className="text-destructive font-medium mt-1">
                                    {errors.confirmPassword.message}
                                </FieldDescription>
                            )}
                        </Field>

                        <Button
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full h-11"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Resetting Password&hellip;
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>

                        <div className="text-center pt-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                            >
                                <ArrowLeft className="size-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <Card className="shadow-lg border-neutral-200/60">
                <CardContent className="p-12 flex justify-center items-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
