"use client";

import { Star, ThumbsUp } from "lucide-react";

const ReviewCard = ({ name, rating, text, date, helpful }) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-blue-500/20 transition-all h-full flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                    {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{name}</h4>
                    <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-current" : "fill-current opacity-20"}`} />
                        ))}
                    </div>
                </div>
            </div>
            <span className="text-[10px] font-medium text-slate-400">{date}</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4 flex-grow">
            "{text}"
        </p>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/5 mt-auto">
            <ThumbsUp className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-500">{helpful} found helpful</span>
        </div>
    </div>
);

const InvestorReviews = () => {
    const reviews = [
        {
            name: "Arjun Sharma",
            rating: 5,
            text: "Great returns every week! Very reliable and transparent platform. Customer support is excellent.",
            date: "2w ago",
            helpful: 23,
        },
        {
            name: "Priya Patel",
            rating: 5,
            text: "I was looking for a consistent yield without deep involvement. Tech Growth Index performs as promised.",
            date: "1mo ago",
            helpful: 15,
        },
        {
            name: "Rajiv Malhotra",
            rating: 4,
            text: "Smooth onboarding process. The weekly credits are consistently on time. Would love more sectoral indices.",
            date: "1mo ago",
            helpful: 8,
        },
    ];

    return (
        <section className="mt-8">
            <div className="flex items-center gap-3 mb-6 px-1">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Investor Reviews
                </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review, index) => (
                    <ReviewCard key={index} {...review} />
                ))}
            </div>
        </section>
    );
};

export default InvestorReviews;
