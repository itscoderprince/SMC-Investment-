"use client";

import { CheckCircle2 } from "lucide-react";

const AboutIndex = ({ description }) => {
    const features = [
        "Weekly returns of 2-5%",
        "Expert-managed portfolio",
        "Diversified risk management",
        "Transparent performance tracking",
        "Easy withdrawal anytime",
    ];

    return (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                About this Index
            </h2>

            <div className="space-y-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-none whitespace-pre-wrap">
                {description || "No description available for this investment index."}
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AboutIndex;
