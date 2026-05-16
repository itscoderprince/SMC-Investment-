// Server Component — no hooks, no browser APIs, fully SSR-able

import { ShieldCheck, Wallet, ChartLine, LockKeyhole, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
// Note: Card structure is custom-built in this file, no need for external card imports if not used.

const FeatureCard = ({ icon: Icon, title, description, colorClass, delay }) => {
    return (
        <div
            className={cn(
                "group relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300",
                "hover:bg-white/10 hover:border-white/20",
                "animate-in fade-in slide-in-from-bottom-4 duration-700"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300",
                "bg-white/5 text-slate-300 group-hover:text-blue-400 group-hover:scale-110"
            )}>
                <Icon className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
                {title}
            </h3>
            <p className="text-slate-400 text-sm font-normal leading-relaxed">
                {description}
            </p>
        </div>
    );
};

const Features = () => {
    const features = [
        {
            icon: ShieldCheck,
            title: "Triple-Blind Verification",
            description: "Every transaction undergoes a strict, three-step human-led audit cycle to eliminate digital discrepancies.",
            colorClass: "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10",
            delay: 0
        },
        {
            icon: Wallet,
            title: "Sovereign-Grade Ledger",
            description: "We bypass vulnerable online gateways. Your assets are mapped directly against immutable bank-to-bank proofs.",
            colorClass: "bg-blue-500/10 text-blue-500 shadow-blue-500/10",
            delay: 100
        },
        {
            icon: ChartLine,
            title: "High-Fidelity Analytics",
            description: "Institutional-level reporting with granular weekly performance logs and predictive growth modeling.",
            colorClass: "bg-amber-500/10 text-amber-500 shadow-amber-500/10",
            delay: 200
        },
        {
            icon: LockKeyhole,
            title: "Zero-Trust Architecture",
            description: "A gated investor community protected by multi-vector identity validation and tiered access controls.",
            colorClass: "bg-rose-500/10 text-rose-500 shadow-rose-500/10",
            delay: 300
        }
    ];

    return (
        <section id="features" aria-labelledby="features-heading" className="py-20 px-4 md:px-6">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
