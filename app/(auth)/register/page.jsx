"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff, Check, ShieldCheck, UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Schema - Split into logical steps validation when navigating
const registerSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^\+?[\d\s\-]{7,20}$/, "Invalid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

function RegisterForm() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(registerSchema),
        mode: "onChange", // Real-time validation for better UX
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

    // Validate step 1 before moving to step 2
    const nextStep = async () => {
        const isValid = await trigger(["fullName", "email", "phone"]);
        if (isValid) setStep(2);
    };

    const prevStep = () => setStep(1);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Direct fetch call for maximum stability
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    referralCode: data.referralCode || undefined,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || result.message || "Registration failed");
            }

            // Sync with store
            useAuthStore.setState({
                user: result.data.user,
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
                isAuthenticated: true,
                isLoading: false
            });

            // Persist to localStorage
            try {
                const storage = {
                    state: {
                        user: result.data.user,
                        accessToken: result.data.accessToken,
                        refreshToken: result.data.refreshToken,
                        isAuthenticated: true
                    },
                    version: 0
                };
                localStorage.setItem('auth-storage', JSON.stringify(storage));
            } catch (e) { console.error(e) }

            toast.success("Account created successfully! Welcome aboard.");
            router.push("/dashboard");

        } catch (error) {
            console.error("Registration error:", error);
            const msg = error instanceof Error ? error.message : "Registration failed";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate progress for step indicator
    const stepProgress = step === 1 ? 50 : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="w-full max-w-sm mx-auto"
        >
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden">

                {/* Header with Progress */}
                <div className="relative px-6 pt-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                {step === 1 ? "Personal Details" : "Security Setup"}
                            </h1>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                Step {step} of 2
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            {step === 1 ? <UserPlus className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-600 rounded-full"
                            initial={{ width: "50%" }}
                            animate={{ width: `${stepProgress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
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
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wide font-bold text-slate-500 ml-1">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...register("fullName")}
                                            placeholder="John Doe"
                                            className={cn(
                                                "w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none transition-all",
                                                errors.fullName
                                                    ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            )}
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.fullName.message}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wide font-bold text-slate-500 ml-1">Email Address <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...register("email")}
                                            type="email"
                                            placeholder="you@example.com"
                                            className={cn(
                                                "w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none transition-all",
                                                errors.email
                                                    ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            )}
                                        />
                                    </div>
                                    {errors.email && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.email.message}</p>}
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wide font-bold text-slate-500 ml-1">Phone Number <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...register("phone")}
                                            type="tel"
                                            placeholder="+1 234 567 8900"
                                            className={cn(
                                                "w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none transition-all",
                                                errors.phone
                                                    ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            )}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.phone.message}</p>}
                                </div>

                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20"
                                >
                                    Continue <ArrowRight className="ml-2 w-4 h-4" />
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
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wide font-bold text-slate-500 ml-1">Password <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a strong password"
                                            className={cn(
                                                "w-full h-10 pl-10 pr-10 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none transition-all",
                                                errors.password
                                                    ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.password.message}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wide font-bold text-slate-500 ml-1">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...register("confirmPassword")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Repeat password"
                                            className={cn(
                                                "w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none transition-all",
                                                errors.confirmPassword
                                                    ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            )}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-[10px] text-red-500 font-medium pl-1">Passwords do not match</p>}
                                </div>

                                {/* Referral Code */}
                                <div className="space-y-1 pt-2">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">#</div>
                                        <input
                                            {...register("referralCode")}
                                            placeholder="Referral Code (Optional)"
                                            className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal"
                                        />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-3 pt-2">
                                    <div className="relative flex items-start">
                                        <input
                                            {...register("agreeTerms")}
                                            type="checkbox"
                                            id="terms"
                                            className="peer h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <label htmlFor="terms" className="text-[11px] leading-tight text-slate-500">
                                        I verify that I am over 18 years of age and I agree to the <Link href="/terms" className="text-blue-600 font-semibold hover:underline">Terms of Service</Link> & <Link href="/privacy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link> <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                {errors.agreeTerms && <p className="text-[10px] text-red-500 font-medium pl-1">You must agree to continue</p>}

                                <div className="flex gap-3 mt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        className="h-10 w-12 rounded-xl border-slate-200 text-slate-500"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Complete Registration"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 text-center">
                        <p className="text-[11px] text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
