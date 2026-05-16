"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
    FieldLabel,
} from "@/components/ui/field";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { registerSchema } from "@/lib/validations/auth";

function RegisterForm() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const registerUser = useAuthStore((state) => state.register);

    const {
        register,
        handleSubmit,
        trigger,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            referralCode: searchParams.get("ref") || "",
            agreeTerms: false,
        },
    });

    const nextStep = async () => {
        const isValid = await trigger(["fullName", "email", "phone"]);
        if (isValid) setStep(2);
    };

    const prevStep = () => setStep(1);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await registerUser(data);
            toast.success("Account created successfully! Welcome aboard.");
            router.push("/dashboard");
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const stepProgress = step === 1 ? 50 : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="w-full max-w-sm mx-auto"
        >
            <Card className="shadow-lg border-neutral-200/60 dark:border-white/5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="relative pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col text-left">
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                {step === 1 ? "Personal Details" : "Security Setup"}
                            </CardTitle>
                            <CardDescription className="text-[10px] uppercase tracking-wider font-semibold">
                                Step {step} of 2
                            </CardDescription>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            {step === 1 ? <UserPlus className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                    </div>

                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-600 rounded-full"
                            initial={{ width: "50%" }}
                            animate={{ width: `${stepProgress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    {/* Full Name */}
                                    <Field>
                                        <FieldLabel htmlFor="fullName" icon={User}>Full Name</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...register("fullName")}
                                                id="fullName"
                                                placeholder="John Doe"
                                                className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.fullName && <FieldDescription className="text-destructive font-medium text-[11px] mt-1">{errors.fullName.message}</FieldDescription>}
                                    </Field>

                                    {/* Email */}
                                    <Field>
                                        <FieldLabel htmlFor="email" icon={Mail}>Email Address</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...register("email")}
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.email && <FieldDescription className="text-destructive font-medium text-[11px] mt-1">{errors.email.message}</FieldDescription>}
                                    </Field>

                                    {/* Phone */}
                                    <Field>
                                        <FieldLabel htmlFor="phone" icon={Phone}>Phone Number</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...register("phone")}
                                                id="phone"
                                                type="tel"
                                                placeholder="+1 234 567 8900"
                                                className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.phone && <FieldDescription className="text-destructive font-medium text-[11px] mt-1">{errors.phone.message}</FieldDescription>}
                                    </Field>

                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full h-11 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20"
                                    >
                                        Continue <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    {/* Password */}
                                    <Field>
                                        <FieldLabel htmlFor="password" icon={Lock}>Password</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...register("password")}
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a strong password"
                                                className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 pr-10 h-11"
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
                                        {errors.password && <FieldDescription className="text-destructive font-medium text-[11px] mt-1">{errors.password.message}</FieldDescription>}
                                    </Field>

                                    {/* Confirm Password */}
                                    <Field>
                                        <FieldLabel htmlFor="confirmPassword" icon={Lock}>Confirm Password</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...register("confirmPassword")}
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Repeat password"
                                                className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.confirmPassword && <FieldDescription className="text-destructive font-medium text-[11px] mt-1">Passwords do not match</FieldDescription>}
                                    </Field>

                                    {/* Referral Code */}
                                    <Field>
                                        <FieldLabel htmlFor="referralCode">Referral Code (Optional)</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...register("referralCode")}
                                                id="referralCode"
                                                placeholder="Referral Code"
                                                className="bg-muted/30 focus-visible:bg-white dark:focus-visible:bg-slate-950 font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </Field>

                                    {/* Terms and Conditions */}
                                    <div className="flex items-start gap-3 pt-2">
                                        <Checkbox
                                            id="agreeTerms"
                                            checked={watch("agreeTerms")}
                                            onCheckedChange={(checked) => setValue("agreeTerms", checked === true, { shouldValidate: true })}
                                            className="mt-0.5"
                                        />
                                        <label htmlFor="agreeTerms" className="text-[11px] leading-tight text-muted-foreground">
                                            I verify that I am over 18 years of age and I agree to the <Link href="/terms" className="text-blue-600 font-semibold hover:underline">Terms of Service</Link> & <Link href="/privacy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link> <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    {errors.agreeTerms && <p className="text-[10px] text-red-500 font-medium pl-1 mt-1">{errors.agreeTerms.message}</p>}

                                    <div className="flex gap-3 mt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            className="h-11 w-12 rounded-xl border-slate-200 dark:border-white/10 text-muted-foreground"
                                        >
                                            <ArrowLeft className="size-5" />
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                    Registering...
                                                </>
                                            ) : (
                                                "Complete Registration"
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </CardContent>

                <CardFooter className="px-6 pb-6 text-center justify-center border-t border-slate-100 dark:border-white/5 pt-4">
                    <p className="text-xs text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                            Sign In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <Card className="shadow-lg border-neutral-200/60 dark:border-white/5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl">
                <CardContent className="p-12 flex justify-center items-center">
                    <Loader2 className="size-8 animate-spin text-blue-600" />
                </CardContent>
            </Card>
        }>
            <RegisterForm />
        </Suspense>
    );
}
