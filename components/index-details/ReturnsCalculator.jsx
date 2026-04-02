"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ReturnsCalculator = () => {
    const [amount, setAmount] = useState(25000);
    const [duration, setDuration] = useState(12); // weeks
    const [rateType, setRateType] = useState("average"); // conservative, average, optimistic
    const [showBreakdown, setShowBreakdown] = useState(false);

    const rates = {
        conservative: 0.03,
        average: 0.045,
        optimistic: 0.05,
    };

    const currentRate = rates[rateType];
    const totalReturns = Math.round(amount * currentRate * duration);
    const finalAmount = amount + totalReturns;
    const roi = Math.round((totalReturns / amount) * 100);

    const breakdown = Array.from({ length: Math.min(duration, 12) }, (_, i) => ({
        week: i + 1,
        investment: amount,
        return: Math.round(amount * currentRate),
        value: Math.round(amount + amount * currentRate * (i + 1)),
    }));

    return (
        <section id="calculator" className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-blue-500/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">
                Calculate Your Potential Returns
            </h2>

            <div className="space-y-10">
                {/* Amount Slider */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Investment Amount
                        </p>
                        <span className="text-4xl font-black text-blue-600">
                            ${amount.toLocaleString()}
                        </span>
                    </div>
                    <Slider
                        value={[amount]}
                        onValueChange={(vals) => setAmount(vals[0])}
                        max={1000000}
                        min={100}
                        step={100}
                        className="hover:cursor-pointer"
                    />
                    <div className="flex justify-between px-1">
                        {["100", "10K", "100K", "500K", "1M"].map((mark) => (
                            <span key={mark} className="text-[10px] font-bold text-slate-400">
                                {mark}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Duration Tabs */}
                <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Investment Duration
                    </p>
                    <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-2xl border border-slate-100 dark:border-white/5">
                        {[
                            { label: "1M", weeks: 4 },
                            { label: "3M", weeks: 12 },
                            { label: "6M", weeks: 24 },
                            { label: "1Y", weeks: 52 },
                        ].map((d) => (
                            <button
                                key={d.label}
                                onClick={() => setDuration(d.weeks)}
                                className={cn(
                                    "py-2.5 rounded-xl text-xs font-black transition-all",
                                    duration === d.weeks
                                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rate Type Selector */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Expected Return Rate
                        </p>
                        <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            {(currentRate * 100).toFixed(1)}% / week
                        </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {["conservative", "average", "optimistic"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setRateType(type)}
                                className={cn(
                                    "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    rateType === type
                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                                        : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-white/10 hover:border-blue-500/50"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20">
                    <div className="grid grid-cols-2 gap-8 items-start mb-8">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-1">Your Investment</p>
                                <p className="text-2xl font-black">${amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-1">Duration</p>
                                <p className="text-2xl font-black">{duration} Weeks</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge className="bg-white/20 text-white border-none font-black px-4 py-1.5 rounded-full text-xs mb-4">
                                {roi}% ROI
                            </Badge>
                            <div>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-1">Total Returns</p>
                                <p className="text-4xl font-black text-emerald-400">${totalReturns.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-1">Final Amount</p>
                            <p className="text-3xl font-black">${finalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Breakdown Toggle */}
                <div className="pt-4">
                    <button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mx-auto"
                    >
                        {showBreakdown ? "Hide Weekly Breakdown" : "View Weekly Breakdown"}
                        {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence>
                        {showBreakdown && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-6"
                            >
                                <div className="rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead className="bg-slate-50 dark:bg-white/5">
                                            <tr>
                                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Week</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Return</th>
                                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                            {breakdown.map((row) => (
                                                <tr key={row.week}>
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.week}</td>
                                                    <td className="px-6 py-4 font-bold text-emerald-500">+${row.return.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${row.value.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {duration > 12 && (
                                        <div className="p-4 bg-slate-50 dark:bg-white/10 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing first 12 weeks of {duration}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-16 text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
                    Invest ${amount.toLocaleString()} Now
                </Button>
            </div>
        </section>
    );
};

export default ReturnsCalculator;
