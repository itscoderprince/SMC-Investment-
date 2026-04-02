"use client";

import { TrendingUp, Quote } from "lucide-react";

export function AuthSidePanel({ variant = "login" }) {
    const content = {
        login: {
            quote: "Investing is not about beating others at their game. It's about controlling yourself at your own game.",
            author: "Benjamin Graham",
            features: [
                "Real-time market tracking",
                "Secure digital assets vault",
                "Automated portfolio rebalancing"
            ]
        },
        register: {
            quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
            author: "Chinese Proverb",
            features: [
                "Instant account approval",
                "Educational resources for beginners",
                "Low transaction fees"
            ]
        },
        forgot: {
            quote: "Security is not a product, but a process.",
            author: "Bruce Schneier",
            features: [
                "Encrypted password recovery",
                "Two-factor authentication support",
                "Session management controls"
            ]
        },
        otp: {
            quote: "Confidence is a plant of slow growth in an aged bosom; youth is the season of credulity.",
            author: "William Pitt",
            features: [
                "Secure verification codes",
                "Anti-phishing protection",
                "Identity validation"
            ]
        },
        verify: {
            quote: "Trust, but verify.",
            author: "Ronald Reagan",
            features: [
                "Email verification security",
                "Account integrity check",
                "Verified investor status"
            ]
        }
    };

    const current = content[variant] || content.login;

    return (
        <div className="bg-muted relative hidden lg:flex flex-col h-full border-l p-10 text-white dark:border-r">
            {/* Background with subtle dark overlay */}
            <div className="absolute inset-0 bg-neutral-900" />

            {/* Subtle Noise/Texture Overlay if needed, but keeping it clean for now */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
                <div className="flex size-8 items-center justify-center rounded-md bg-white text-black">
                    <TrendingUp className="size-5" />
                </div>
                InvestHub Inc.
            </div>

            <div className="relative z-20 mt-auto">
                <blockquote className="space-y-2">
                    <Quote className="size-8 text-neutral-500 mb-4 opacity-50" />
                    <p className="text-xl font-medium leading-relaxed italic">
                        &ldquo;{current.quote}&rdquo;
                    </p>
                    <footer className="text-sm text-neutral-400 font-normal">
                        — {current.author}
                    </footer>
                </blockquote>

                <div className="mt-10 space-y-4 border-t border-neutral-800 pt-10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Platform Benefits
                    </p>
                    <div className="grid gap-4">
                        {current.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                                <div className="size-1.5 rounded-full bg-blue-500" />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trust Badge at bottom */}
            <div className="relative z-20 mt-10 flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-green-500" />
                    System Active
                </div>
                <div className="h-3 w-px bg-neutral-800" />
                <span>ISO 27001 Certified</span>
                <div className="h-3 w-px bg-neutral-800" />
                <span>SEC Regulated</span>
            </div>
        </div>
    );
}
