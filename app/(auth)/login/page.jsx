"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const result = await login(data);
            toast.success("Welcome back! 👋");

            if (result.user?.role === "admin" || result.user?.role === "master_admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            toast.error(err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm mx-auto"
        >
            <Card className="shadow-lg border-neutral-200/60 dark:border-white/5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                            <Mail className="size-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription className="text-xs">
                        Sign in to your SMC Protocol account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <FieldGroup>
                            {/* Email Address */}
                            <Field>
                                <FieldLabel htmlFor="email" icon={Mail}>Email Address</FieldLabel>
                                <div className="relative">
                                    <Input
                                        {...register("email")}
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 transition-colors h-11 pr-4"
                                        autoComplete="email"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <FieldDescription className="text-destructive font-medium mt-1 text-[11px]">
                                        {errors.email.message}
                                    </FieldDescription>
                                )}
                            </Field>

                            {/* Password */}
                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="password" icon={Lock}>Password</FieldLabel>
                                    <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        {...register("password")}
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 transition-colors pr-10 h-11"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <FieldDescription className="text-destructive font-medium mt-1 text-[11px]">
                                        {errors.password.message}
                                    </FieldDescription>
                                )}
                            </Field>

                            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-semibold text-sm transition-all mt-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Signing In&hellip;
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 size-4" />
                                    </>
                                )}
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter className="px-6 pb-6 text-center justify-center border-t border-slate-100 dark:border-white/5 pt-4">
                    <p className="text-xs text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                            Create Account
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
