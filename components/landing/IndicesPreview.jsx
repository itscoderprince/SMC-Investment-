"use client";

import { TrendingUp, BarChart3, Activity, PieChart, Shield, Lock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIndices } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

const Sparkline = ({ points, color }) => {
    const width = 100;
    const height = 30;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;

    const pathData = points.map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
        <svg 
            width={width} 
            height={height} 
            className="overflow-visible"
            role="img"
            aria-label="Investment performance sparkline chart"
        >
            <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

// Icon mapping for dynamic icons
const iconMap = {
    Shield,
    BarChart3,
    Activity,
    PieChart,
};

// Default sparkline points if not provided
const defaultPoints = [30, 35, 32, 38, 45, 42, 48, 55];
const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const IndexCard = ({ id, slug, name, currentReturnRate, description, icon, points, color, lockPeriod }) => {
    const Icon = iconMap[icon] || Shield;
    const sparklinePoints = points || defaultPoints;

    return (
        <div className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Icon size={20} aria-hidden="true" />
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
                            <TrendingUp size={14} aria-hidden="true" />
                            <span className="sr-only">Growth rate:</span>
                            +{currentReturnRate}%
                        </div>
                    </div>
                </div>

                <h4 className="text-lg font-semibold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">
                    {name}
                </h4>
                <p className="text-sm font-normal text-slate-400 leading-relaxed mb-6 line-clamp-2">
                    {description}
                </p>

                {/* Display Lock Period if available */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                        <Lock size={12} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-300">
                            {lockPeriod || "1 Year"}
                        </span>
                    </div>
                </div>

                <div className="mt-auto space-y-5">
                    <div className="flex items-center justify-between">
                        <Sparkline points={sparklinePoints} color={color} />
                    </div>

                    <Button
                        asChild
                        aria-label={`View details for ${name} investment index`}
                        className="w-full h-10 bg-white/5 hover:bg-blue-600 text-white font-medium rounded-xl border border-white/10 hover:border-blue-500/50 transition-all text-sm"
                    >
                        <Link href={`/indices/${slug || id}`}>
                            View Details
                            <ArrowUpRight size={14} aria-hidden="true" className="ml-2 opacity-50" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

const IndexCardSkeleton = () => (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden p-8">
        <div className="flex justify-between items-start mb-8">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <Skeleton className="w-16 h-8" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-12 w-full mb-8" />
        <Skeleton className="h-12 w-full" />
    </div>
);

const IndicesPreview = () => {
    const { indices: apiIndices, loading, error } = useIndices({ limit: 4 });

    const indices = apiIndices || [];

    return (
        <section id="indices" className="py-20 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
                            Professional <span className="text-blue-500">Investment</span>
                        </h2>
                        <p className="text-slate-400 text-base font-medium leading-relaxed">
                            In our exclusive investment plans, your funds will be managed by a team of experienced Russian traders with deep expertise in global markets. Their strategies will not only protect your investments but also generate the highest returns. Our plans offer flexible terms, transparent processes, and personalized support, helping you achieve your financial goals with ease.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="h-10 border-white/10 rounded-xl px-4 font-medium hover:bg-white/5 text-white bg-transparent">
                            Request Full Registry
                        </Button>
                    </div>
                </div>

                {indices.length === 0 && !loading ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                        <p className="text-slate-400 font-medium">No active investment indices available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading ? (
                            <>
                                <IndexCardSkeleton />
                                <IndexCardSkeleton />
                                <IndexCardSkeleton />
                                <IndexCardSkeleton />
                            </>
                        ) : (
                            indices.map((index, idx) => (
                                <IndexCard
                                    key={index._id || index.id || idx}
                                    {...index}
                                    id={index._id || index.id}
                                    color={colors[idx % colors.length]}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default IndicesPreview;
