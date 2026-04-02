"use client";

import { CheckCircle2, Copy, Download, TrendingUp, Clock, ChevronRight, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function InvestmentSuccessPage() {
    const requestId = "#PAY-123456";

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could show a toast here
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-950 pb-20">
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-emerald-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-8 relative"
                    >
                        <CheckCircle2 className="w-14 h-14" />
                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4"
                    >
                        Investment Request Submitted! ðŸŽ‰
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        Payment Request <span className="text-blue-600 underline underline-offset-4 decoration-blue-600/30">#PAY-123456</span>
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 max-w-3xl -mt-16 relative z-10">
                <div className="space-y-8">
                    {/* Status Card */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 md:p-12 shadow-2xl shadow-blue-500/5"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-12 border-b border-slate-50 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse"></div>
                                <div>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">Awaiting Payment Verification</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status Step 1 of 3 Complete</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Quick Summary</h4>
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-500">Index</span>
                                            <span className="text-slate-900 dark:text-white uppercase tracking-tight">Tech Growth Index</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-500">Amount</span>
                                            <span className="text-slate-900 dark:text-white">â‚¹25,000</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-500">Weekly Return</span>
                                            <span className="text-emerald-500">â‚¹1,125</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <Button className="rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest" asChild>
                                        <Link href="/invest/track/PAY-123456">Track My Investment</Link>
                                    </Button>
                                    <Button variant="outline" className="rounded-2xl h-14 border-slate-200 dark:border-white/10 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Receipt
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Next Steps Timeline</h4>
                                <div className="space-y-8 relative">
                                    <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-white/5"></div>
                                    {[
                                        { step: 1, title: "Payment Verification", status: "In Progress", duration: "2-4 hours", icon: Clock, color: "text-amber-500" },
                                        { step: 2, title: "Investment Activation", status: "Pending", duration: "Post verification", icon: CheckCircle2, color: "text-slate-300" },
                                        { step: 3, title: "First Returns", status: "Scheduled", duration: "Next Friday", icon: TrendingUp, color: "text-slate-300" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-6 relative z-10 items-start">
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10", idx === 0 ? "border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "")}>
                                                <item.icon className={cn("w-3 h-3", item.color)} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{item.title}</p>
                                                <div className="flex items-center gap-2 uppercase tracking-widest">
                                                    <span className={cn("text-[8px] font-black", item.color)}>{item.status}</span>
                                                    <span className="text-[10px] text-slate-300">â€¢</span>
                                                    <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">{item.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Support Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/dashboard" className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                    <Home className="w-5 h-5" />
                                </div>
                                <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs transition-colors group-hover:text-blue-600">Back to Dashboard</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                        </Link>
                        <Link href="/indices" className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                                <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs transition-colors group-hover:text-blue-600">Invest in Another Index</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
