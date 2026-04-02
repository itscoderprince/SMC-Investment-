"use client";

import { z } from "zod";

// Common validation patterns
const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address");

const passwordSchema = z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

const fullNameSchema = z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters");

// Login Schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

// Register Schema
export const registerSchema = z
    .object({
        fullName: fullNameSchema,
        email: emailSchema,
        phone: z
            .string()
            .min(1, "Phone number is required")
            .regex(/^\+?[\d\s\-]{7,20}$/, "Please enter a valid phone number"),
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
        referralCode: z.string().optional(),
        agreeTerms: z.boolean().refine((val) => val === true, {
            message: "You must agree to the Terms & Conditions",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

// OTP Verification Schema
export const otpSchema = z.object({
    otp: z
        .string()
        .min(6, "OTP must be 6 digits")
        .max(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers"),
});

// Reset Password Schema
export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Helper function to calculate password strength
export const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    if (score <= 2)
        return { strength: 33, label: "Weak", color: "bg-red-500" };
    if (score <= 3)
        return { strength: 66, label: "Medium", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
};
