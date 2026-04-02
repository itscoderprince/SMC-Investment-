"use client";

import { Star, Users, Briefcase, TrendingUp, Calculator, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const IndexHero = ({ data, onInvest }) => {
    return (
        <section className="animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left Side: Info */}
                <div className="flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline" className="rounded-md px-2.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                            {data.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-slate-700 dark:text-slate-300">{data.rating}</span>
                            <span>({data.reviews.toLocaleString()} reviews)</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                        {data.name}
                    </h1>

                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mb-8">
                        {data.tagline}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={onInvest} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors">
                            Invest Now
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 px-6 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                            onClick={() => document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Audit Performance
                        </Button>
                    </div>
                </div>

                {/* Right Side: Metrics Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Current Weekly Return</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{data.currentReturn}</span>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                                    {data.trend}
                                </span>
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Min. Investment</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{data.minInvestment}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Total Investors</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-slate-400" />
                                {data.totalInvestors}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Fund Size</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{data.fundSize}</p>
                        </div>
                        <div className="flex items-end">
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-normal text-xs px-2.5 py-0.5">
                                Verified Index
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IndexHero;
