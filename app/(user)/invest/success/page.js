"use client";

import { CheckCircle, Download, TrendingUp, Clock, ChevronRight, Home, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function InvestmentSuccessPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* ─── Top Banner Segment ─── */}
                <div className="bg-[#0f172a] rounded-t-3xl p-8 md:p-12 text-center relative overflow-hidden border border-slate-800">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 12, delay: 0.1 }}
                            className="w-20 h-20 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 shadow-2xl"
                        >
                            <CheckCircle className="w-10 h-10" />
                        </motion.div>

                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Pipeline Dispatched</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Contract Reference ID: PROXY-NODE-LOCKED</p>
                    </div>
                </div>

                {/* ─── Main Details Area ─── */}
                <div className="bg-white rounded-b-3xl border border-t-0 border-slate-100 shadow-2xl p-6 md:p-10 space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Snapshot */}
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Snapshot Allocation</h3>
                            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">Awaiting Nodes</span>
                                </div>
                                <div className="h-px bg-slate-200/50" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount Deployed</span>
                                    <span className="text-lg font-black text-slate-900">$ --.--</span>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <Button asChild className="w-full h-12 bg-[#0f172a] hover:bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-slate-200 text-[11px] uppercase tracking-[0.2em] transition-all">
                                    <Link href="/investments">Load Tracking Terminal</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sequential Path</h3>
                            
                            <div className="space-y-5 relative pl-2">
                                <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-slate-100 -z-10" />
                                
                                {[
                                    { label: "Layer 1 Protocol Verification", active: true, icon: Clock },
                                    { label: "Consensus Settlement", active: false, icon: Zap },
                                    { label: "Liquidity Node Active", active: false, icon: TrendingUp },
                                ].map((stp, i) => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <div className={cn(
                                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm bg-white z-10",
                                            stp.active ? "border-amber-500 text-amber-500" : "border-slate-200 text-slate-300"
                                        )} />
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-[11px] font-black uppercase tracking-wide",
                                                stp.active ? "text-slate-900" : "text-slate-400"
                                            )}>{stp.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Sub Controls ─── */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <Link href="/dashboard" className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-100 bg-white text-[10px] font-black text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-widest">
                        <Home className="w-4 h-4" /> Exit Home
                    </Link>
                    <Link href="/invest" className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-100 bg-white text-[10px] font-black text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-widest">
                        Re-Entry <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
