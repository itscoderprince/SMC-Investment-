"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.error || json.message || "Invalid credentials";
        throw new Error(msg);
      }

      const { accessToken, refreshToken, user } = json.data;

      // Update Zustand store
      useAuthStore.setState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Persist to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        existing.state = { ...existing.state, user, accessToken, refreshToken, isAuthenticated: true };
        localStorage.setItem("auth-storage", JSON.stringify(existing));
      } catch (_) { }

      toast.success("Welcome back! 👋");

      if (user?.role === "admin" || user?.role === "master_admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err) || "Login failed";
      toast.error(msg);
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
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Sign in to your SMC Protocol account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none transition-all",
                    errors.email
                      ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  )}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-medium pl-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-10 pl-10 pr-10 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm outline-none transition-all",
                    errors.password
                      ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
              {errors.password && <p className="text-red-500 text-[10px] font-medium pl-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold text-sm mt-2 transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-1.5 w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-[11px] text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
// Helper icon
function ArrowRight({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
