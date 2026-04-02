"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useIndex } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

// Import all index-details components
import IndexHero from "@/components/index-details/IndexHero";
import PerformanceSection from "@/components/index-details/PerformanceSection";
import IndexFAQ from "@/components/index-details/IndexFAQ";
import SimilarIndices from "@/components/index-details/SimilarIndices";
import RiskDisclosure from "@/components/index-details/RiskDisclosure";
import IndexStickyBar from "@/components/index-details/IndexStickyBar";
import AboutIndex from "@/components/index-details/AboutIndex";
import HowItWorksIndex from "@/components/index-details/HowItWorksIndex";
import InvestorReviews from "@/components/index-details/InvestorReviews";

export default function IndexDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const { index, loading, error } = useIndex(id);

    const handleInvest = () => {
        router.push(`/indices/${id}/invest`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#020617]">
                <Navbar />
                <main className="container mx-auto max-w-7xl pt-32 px-4 pb-24">
                    <Skeleton className="h-8 w-48 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-96 w-full" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !index) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#020617]">
                <Navbar />
                <main className="container mx-auto max-w-7xl pt-48 px-4 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <h1 className="text-3xl font-black mb-4">Index Not Found</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            The investment index you're looking for doesn't exist or has been moved.
                        </p>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-2xl font-black">
                            <Link href="/">Return to Navigation</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Transform API data for IndexHero component
    const heroData = {
        category: index.category || "Investment",
        name: index.name,
        tagline: index.shortDescription || index.description || "Premium investment opportunity with verified returns.",
        rating: 4.5,
        reviews: 1234,
        currentReturn: `${index.currentReturnRate}%`,
        trend: "+0.3%",
        minInvestment: `$${index.minInvestment?.toLocaleString() || "100"}`,
        totalInvestors: `${index.activeInvestors || 0}`,
        fundSize: `$${(index.totalInvested || 0).toLocaleString()}`
    };

    // Transform API data for InvestmentModal component
    const modalIndexData = {
        _id: index._id,
        name: index.name,
        category: index.category,
        currentReturnRate: index.currentReturnRate,
        minInvestment: index.minInvestment,
        riskLevel: index.riskLevel
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] font-sans selection:bg-blue-100 selection:text-blue-900 selection:dark:bg-blue-900 selection:dark:text-blue-100">
            <Navbar />

            <main className="pt-24 pb-12 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Back Link */}
                    <div className="mb-6">
                        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group">
                            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                            Back to Investment Indices
                        </Link>
                    </div>

                    {/* Hero Section */}
                    <div className="mb-10">
                        <IndexHero data={heroData} onInvest={handleInvest} />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* About Section */}
                            <AboutIndex description={index.description} />

                            {/* Performance Overview Section */}
                            <PerformanceSection />

                            {/* How it Works */}
                            <HowItWorksIndex />

                            {/* FAQ Section */}
                            <IndexFAQ />

                            {/* Risk Disclosure Section */}
                            <RiskDisclosure />
                        </div>

                        <div className="space-y-8">
                            {/* Multiplier/Calculator can go here if needed, but the user wanted clean UI */}
                            {/* Similar Indices in Sidebar */}
                            <div className="sticky top-28">
                                <SimilarIndices excludeId={id} />
                            </div>
                        </div>
                    </div>

                    {/* Full Width Sections */}
                    <div className="mt-12 border-t border-slate-100 dark:border-white/5 pt-12">
                        <InvestorReviews />
                    </div>
                </div>
            </main>

            <Footer />

            {/* Sticky Bar */}
            <IndexStickyBar
                name={index.name}
                returns={`${index.currentReturnRate}%`}
                onInvest={handleInvest}
            />
        </div>
    );
}
