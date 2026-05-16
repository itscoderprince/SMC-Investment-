"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// --- SKELETON FALLBACKS ---
const SectionSkeleton = () => (
    <div className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
            <div className="space-y-6 mb-16">
                <Skeleton className="h-6 w-32 bg-white/5" />
                <Skeleton className="h-12 w-2/3 md:w-1/2 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Skeleton className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
                <Skeleton className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
                <Skeleton className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
                <Skeleton className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
            </div>
        </div>
    </div>
);

const TickerSkeleton = () => (
    <div className="w-full h-14 bg-[#020617] border-y border-white/5" />
);

// These components use hooks/browser APIs so they MUST be client-side only
const IndicesPreview = dynamic(() => import("@/components/landing/IndicesPreview"), {
    loading: () => <SectionSkeleton />,
    ssr: false,
});

const Ticker = dynamic(() => import("@/components/landing/Ticker"), {
    loading: () => <TickerSkeleton />,
    ssr: false,
});

const InvestorReviews = dynamic(() => import("@/components/index-details/InvestorReviews"), {
    loading: () => <SectionSkeleton />,
    ssr: false,
});

// AuthRedirect is client-only (uses auth store)
import AuthRedirect from "@/components/AuthRedirect";

export default function ClientSections() {
    return (
        <>
            {/* Handles admin redirect client-side without blocking page render */}
            <AuthRedirect />

            {/* Live data sections — require client-side hooks */}
            <Suspense fallback={<SectionSkeleton />}>
                <IndicesPreview />
            </Suspense>

            <Suspense fallback={<TickerSkeleton />}>
                <Ticker />
            </Suspense>

            {/* Reviews — loaded lazily after all above-fold content */}
            <Suspense fallback={<SectionSkeleton />}>
                <div className="container mx-auto max-w-7xl px-4 md:px-6 pb-24 border-t border-white/5 pt-20">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
                            What Our <span className="text-blue-500">Investors</span> Say
                        </h2>
                        <p className="text-slate-400 max-w-2xl text-base font-medium">
                            Trusted by thousands of users worldwide for consistent returns and professional management.
                        </p>
                    </div>
                    <InvestorReviews />
                </div>
            </Suspense>
        </>
    );
}
