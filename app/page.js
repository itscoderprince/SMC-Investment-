// Server Component — NO "use client" directive
// This page is fully SSR'd, meaning the browser receives pre-rendered HTML immediately.
// This is the #1 driver of LCP and FCP performance scores.

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import OurTeam from "@/components/landing/OurTeam";
import ProtectiveIndex from "@/components/landing/ProtectiveIndex";
import Footer from "@/components/landing/Footer";
import ClientSections from "@/components/landing/ClientSections";
import { Suspense } from "react";

// Static skeleton shown while streaming client sections
const SectionSkeleton = () => (
    <div className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
            <div className="space-y-6 mb-16">
                <div className="h-6 w-32 rounded bg-white/5" />
                <div className="h-12 w-1/2 rounded bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
                <div className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
                <div className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
                <div className="h-64 rounded-[2rem] bg-white/5 border border-white/5" />
            </div>
        </div>
    </div>
);

export default function Home() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30 selection:text-blue-200 scroll-smooth">

            {/* ✅ SSR: Navbar is pre-rendered on the server — instant paint, great LCP */}
            <Navbar />

            <main>
                {/* ✅ SSR: Hero is pre-rendered — users see content immediately */}
                <Hero />

                {/* ✅ CLIENT SECTIONS: IndicesPreview (live API data) + Ticker + Reviews
                    These need client-side hooks, so they stream in after the SSR shell.
                    Wrapped in Suspense so they don't block the initial HTML. */}
                <Suspense fallback={<SectionSkeleton />}>
                    <ClientSections />
                </Suspense>

                {/* ✅ SSR: All static content sections pre-rendered, no JS needed */}
                <Features />
                <HowItWorks />
                <OurTeam />
                <ProtectiveIndex />
            </main>

            {/* ✅ SSR: Footer pre-rendered — no dynamic data needed */}
            <Footer />
        </div>
    );
}
