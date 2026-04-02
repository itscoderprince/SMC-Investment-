"use client";

import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const RiskDisclosure = () => {
    const points = [
        { label: "Minimum investment period", value: "None (withdraw anytime)" },
        { label: "Withdrawal processing time", value: "24-48 hours" },
        { label: "Entry/Exit Fees", value: "No hidden charges or fees" },
        { label: "Verification Required", value: "KYC verification required" },
    ];

    return (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Important Information
                </h2>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide mb-2">Investment Risks:</p>
                        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <li>• Past performance does not guarantee future returns</li>
                            <li>• Weekly returns may vary between 2-5%</li>
                            <li>• Investments are subject to market risks</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {points.map((point, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                        <span className="text-xs font-semibold text-slate-500">{point.label}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{point.value}</span>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Protected by Sovereign Liquidity Index
                    </p>
                </div>
            </div>
        </section>
    );
};

export default RiskDisclosure;
