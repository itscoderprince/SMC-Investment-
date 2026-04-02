"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FieldDescription,
    FieldGroup,
} from "@/components/ui/field";

export default function VerifyEmailPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [email] = useState("user@example.com");

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendEmail = async () => {
        setIsLoading(true);
        try {
            console.log("Resend verification email");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setCountdown(60);
        } catch (error) {
            console.error("Resend email error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg border-neutral-200/60">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                        <Mail className="size-6" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                <CardDescription>
                    A verification link has been sent to{" "}
                    <span className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4 font-mono">{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FieldGroup>
                    <FieldDescription className="text-center text-balance leading-relaxed">
                        Please check your inbox and click the verification link to complete your registration. Don&apos;t forget to check your spam folder!
                    </FieldDescription>

                    <Button
                        onClick={handleResendEmail}
                        disabled={isLoading || countdown > 0}
                        variant="outline"
                        className="w-full h-11 border-neutral-200"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 size-4 opacity-70" />
                        )}
                        {countdown > 0 ? `Resend Available in ${countdown}s` : "Resend Verification Link"}
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
            </CardContent>
        </Card>
    );
}
