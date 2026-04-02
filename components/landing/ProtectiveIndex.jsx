"use client";

import { AlertTriangle, ShieldCheck, Activity, LocateFixed, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const ProtectiveIndex = () => {
    const { isAuthenticated, user } = useAuthStore();

    const getDashboardLink = () => {
        if (!isAuthenticated) return "/register";
        return user?.role === "admin" || user?.role === "master_admin"
            ? "/admin/dashboard"
            : "/dashboard";
    };

    return (
        <section className="py-24 px-4 md:px-6 bg-[#020617] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="rounded-[3rem] border border-white/5 bg-slate-900/50 backdrop-blur-xl p-8 md:p-16 overflow-hidden">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        {/* Left side labels */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                                <AlertTriangle className="w-3 h-3" />
                                Security Warning
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.1]">
                                Investor Protection <br /> <span className="text-blue-500"></span>
                            </h2>

                            <p className="text-slate-400 font-medium leading-relaxed max-w-md">
                                SMC operates outside standard unencrypted retail gateways.
                                All capital allocations are mapped against physical bank
                                settlement proofs and protected by our sovereign-grade
                                insurance ledger.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: ShieldCheck, text: "Gated Institutional Access Only", color: "text-blue-500" },
                                    { icon: Activity, text: "99.9% Auditing Compliance Rate", color: "text-emerald-500" },
                                    { icon: LocateFixed, text: "Encrypted Index Verification", color: "text-amber-500" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                        <span className="text-sm font-bold text-white tracking-wide">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side Visual */}
                        <div className="lg:col-span-7 relative">
                            <div className="aspect-[4/3] rounded-[2rem] bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-32 h-32 rounded-full bg-blue-600/20 flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500 animate-spin duration-[10s]"></div>
                                    <ShieldCheck className="w-16 h-16 text-blue-500" />
                                </div>

                                <h3 className="text-2xl font-black text-white mb-4">Final Settlement Protocol</h3>
                                <p className="text-slate-400 text-sm font-medium mb-8 max-w-sm">
                                    By initializing an account, you agree to the 72-hour human-audited settlement period for all initial funding operations.
                                </p>

                                <Button asChild className="bg-white hover:bg-slate-100 text-slate-900 font-black rounded-full px-10 h-14 group">
                                    <Link href={getDashboardLink()} className="flex items-center gap-2">
                                        Initialize Guardian Lock
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Animated dots */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:12px_12px] opacity-50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProtectiveIndex;
