"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { otpSchema } from "@/lib/validations/auth";

export default function VerifyOTPPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            console.log("OTP submitted:", data);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
            console.error("OTP verification error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            console.log("Resend OTP");
            setCountdown(60);
            setValue("otp", "");
        } catch (error) {
            console.error("Resend OTP error:", error);
        }
    };

    return (
        <Card className="shadow-lg border-neutral-200/60">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                        <ShieldCheck className="size-6" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Verification Code</CardTitle>
                <CardDescription>
                    Please enter the 6-digit code sent to your email
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Field className="items-center">
                            <FieldLabel htmlFor="otp" className="mb-2">Enter Code</FieldLabel>
                            <InputOTP
                                maxLength={6}
                                id="otp"
                                onChange={(value) => setValue("otp", value)}
                                required
                            >
                                <InputOTPGroup className="gap-2 sm:gap-4">
                                    <InputOTPSlot index={0} className="size-10 sm:size-12 bg-muted/30" />
                                    <InputOTPSlot index={1} className="size-10 sm:size-12 bg-muted/30" />
                                    <InputOTPSlot index={2} className="size-10 sm:size-12 bg-muted/30" />
                                    <InputOTPSlot index={3} className="size-10 sm:size-12 bg-muted/30" />
                                    <InputOTPSlot index={4} className="size-10 sm:size-12 bg-muted/30" />
                                    <InputOTPSlot index={5} className="size-10 sm:size-12 bg-muted/30" />
                                </InputOTPGroup>
                            </InputOTP>
                            {errors.otp && (
                                <FieldDescription className="text-destructive font-medium mt-2">
                                    {errors.otp.message}
                                </FieldDescription>
                            )}
                        </Field>

                        <Button type="submit" disabled={isLoading} className="w-full h-11">
                            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Verify Identity
                        </Button>

                        <div className="text-center text-sm">
                            {countdown > 0 ? (
                                <p className="text-muted-foreground">
                                    Resend code in <span className="font-semibold text-foreground">{countdown}s</span>
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Didn&apos;t receive the code?</p>
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="font-semibold text-primary underline-offset-4 hover:underline"
                                    >
                                        Resend Security Code
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 text-center">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
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
