"use client";

import {
    Shield,
    Fingerprint,
    Wallet,
    Settings2,
    Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProtocolStep = ({ step, title, description, icon: Icon, time, align, isFirst }) => {
    return (
        <div className={cn(
            "relative flex flex-col md:flex-row items-start md:items-center gap-8 group animate-in fade-in slide-in-from-bottom-8 duration-700",
            align === "right" ? "md:flex-row-reverse" : ""
        )}>
            {/* Content */}
            <div className={cn(
                "md:w-1/2 order-2 pl-14 md:pl-0",
                align === "left" ? "md:text-right md:pr-16" : "md:text-left md:pl-16"
            )}>
                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                    {title}
                </h3>
                <p className={cn(
                    "text-slate-400 font-medium text-sm md:text-base mt-3 leading-relaxed max-w-md",
                    align === "left" ? "ml-0 md:ml-auto" : "mr-0 md:mr-auto"
                )}>
                    {description}
                </p>
                <div className="md:hidden mt-4">
                    <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-widest">
                        STEP {step} // {time}
                    </span>
                </div>
            </div>

            {/* Central Index */}
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center order-1 md:order-2 z-20">
                <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#0f172a] border flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                    isFirst
                        ? "border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        : "border-white/10 group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                )}>
                    <Icon className={cn(
                        "w-5 h-5 md:w-7 md:h-7 transition-colors duration-300",
                        isFirst ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"
                    )} />
                </div>
                {isFirst && <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping -z-10"></span>}
            </div>

            {/* Desktop Step Label */}
            <div className={cn(
                "hidden md:block md:w-1/2",
                align === "left" ? "md:order-3 md:pl-16" : "md:order-1 md:pr-16 md:text-right"
            )}>
                <div className="inline-flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-blue-400/60 uppercase tracking-widest">
                        {step === "01" ? "Instant" : step === "02" ? "Secured" : step === "03" ? "Locked" : "Streaming"}
                    </span>
                    <span className="font-mono text-xs text-white/40 bg-white/5 px-2 py-1 rounded border border-white/10 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                        STEP {step} // {time}
                    </span>
                </div>
            </div>
        </div>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            step: "01",
            title: "Identity Verification",
            description: "Submit corporate entity documents via secure vault for automated KYC/KYB processing.",
            icon: Fingerprint,
            time: "00:00",
            align: "left",
            isFirst: true,
        },
        {
            step: "02",
            title: "Capital Deposit",
            description: "Seamless multi-chain bridging or fiat on-ramp. Assets are segregated in smart contract vaults.",
            icon: Wallet,
            time: "INSTANT",
            align: "right",
        },
        {
            step: "03",
            title: "Strategy Allocation",
            description: "Select from pre-audited high-yield strategies or configure custom algorithmic parameters.",
            icon: Settings2,
            time: "AUTOMATED",
            align: "left",
        },
        {
            step: "04",
            title: "Real-time Yield",
            description: "Monitor performance via dashboard. Interest compounds every block. Withdraw anytime.",
            icon: Activity,
            time: "LIVE",
            align: "right",
        },
    ];

    return (
        <section id="how-it-works" className="py-24 px-4 md:px-6 relative overflow-hidden bg-[#020617]">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        <Shield className="w-3 h-3" />
                        Onboarding Protocol
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
                        Protocol Integration <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Sequence</span>
                    </h2>
                    <div className="h-1 bg-blue-600 mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] w-20"></div>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -ml-[0.5px] md:transform md:-translate-x-1/2"></div>
                    <div
                        className="absolute left-6 md:left-1/2 top-0 w-[1px] bg-gradient-to-b from-blue-600 via-emerald-500 to-transparent -ml-[0.5px] md:transform md:-translate-x-1/2 opacity-50 shadow-[0_0_15px_#2563eb]"
                        style={{ height: "70%" }}
                    ></div>

                    <div className="space-y-20">
                        {steps.map((stepData) => (
                            <ProtocolStep key={stepData.step} {...stepData} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
