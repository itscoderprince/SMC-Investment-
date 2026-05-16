"use client";

import { useState } from "react";
import { Star, ThumbsUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReviewCard = ({ name, rating, text, date, helpful }) => (
    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col group">
        <div className="flex justify-between items-start gap-3 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm uppercase border border-blue-500/20">
                    {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{name}</h4>
                    <div className="flex items-center gap-0.5 text-amber-500 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-current" : "fill-current opacity-20"}`} />
                        ))}
                    </div>
                </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{date}</span>
        </div>

        <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6 flex-grow italic">
            "{text}"
        </p>

        <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                <ThumbsUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400">{helpful} found helpful</span>
            </div>
        </div>
    </div>
);

const InvestorReviews = () => {
    // Optimization: Only load 3 reviews initially to speed up first paint
    const [visibleCount, setVisibleCount] = useState(3);
    
    const reviews = [
        {
            name: "Arjun Sharma",
            rating: 5,
            text: "Great returns every week! Very reliable and transparent platform. Customer support is excellent and always ready to help with any technical queries.",
            date: "2w ago",
            helpful: 23,
        },
        {
            name: "Priya Patel",
            rating: 5,
            text: "I was looking for a consistent yield without deep involvement. Tech Growth Index performs exactly as promised in the registry reports.",
            date: "1mo ago",
            helpful: 15,
        },
        {
            name: "Rajiv Malhotra",
            rating: 4,
            text: "Smooth onboarding process. The weekly credits are consistently on time. Would love to see more sectoral indices in the future.",
            date: "1mo ago",
            helpful: 8,
        },
        {
            name: "Vikram Singh",
            rating: 5,
            text: "The security measures here are institutional grade. I feel safe investing my portfolio through SMC's gated protocols.",
            date: "2mo ago",
            helpful: 31,
        },
        {
            name: "Sarah Chen",
            rating: 5,
            text: "Finally a platform that provides real bank-to-bank proofs. The transparency is unmatched in the current retail market.",
            date: "3mo ago",
            helpful: 19,
        },
        {
            name: "Michael Ross",
            rating: 4,
            text: "Impressive risk management. Even during market volatility, my returns remained stable. Highly recommended for long-term growth.",
            date: "3mo ago",
            helpful: 12,
        },
    ];

    const showMore = () => {
        setVisibleCount(prev => Math.min(prev + 3, reviews.length));
    };

    return (
        <section className="mt-8">
            <div className="flex items-center gap-3 mb-8 px-1">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Investor Feedback
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Verified returns & community trust</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.slice(0, visibleCount).map((review, index) => (
                    <ReviewCard key={index} {...review} />
                ))}
            </div>

            {visibleCount < reviews.length && (
                <div className="mt-12 flex justify-center">
                    <Button 
                        onClick={showMore}
                        variant="outline" 
                        className="h-12 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold group transition-all"
                    >
                        Load More Reviews
                        <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    </Button>
                </div>
            )}
        </section>
    );
};

export default InvestorReviews;
