"use client";

import { ChevronRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIndices } from "@/hooks/useApi";

const SimilarIndexCard = ({ name, currentReturnRate, minInvestment, slug }) => (
    <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-blue-500/30 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {name}
            </h4>
            <div className="w-6 h-6 rounded-md bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all">
                <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold text-slate-900 dark:text-white">{currentReturnRate}%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                +0.3%
            </span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
            <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Min. Invest</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">${minInvestment?.toLocaleString()}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700" asChild>
                <Link href={`/indices/${slug}`}>View</Link>
            </Button>
        </div>
    </div>
);

const SimilarIndices = ({ excludeId }) => {
    const { indices, loading } = useIndices();

    if (loading) return null;

    const filteredIndices = indices
        .filter(idx => idx._id !== excludeId && idx.slug !== excludeId)
        .slice(0, 3);

    if (filteredIndices.length === 0) return null;

    return (
        <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                Similar Indices
            </h2>

            <div className="space-y-3">
                {filteredIndices.map((index, i) => (
                    <SimilarIndexCard key={i} {...index} />
                ))}
            </div>
        </section>
    );
};

export default SimilarIndices;
