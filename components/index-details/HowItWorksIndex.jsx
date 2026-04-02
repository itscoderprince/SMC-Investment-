"use client";

import { Wallet, TrendingUp, Calendar, ArrowDownCircle } from "lucide-react";
import { motion } from "framer-motion";

const Step = ({ icon: Icon, title, description, stepNumber, isLast }) => (
    <div className="relative flex flex-col items-center group">
        {/* Connector (Desktop) */}
        {!isLast && (
            <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[1px] bg-slate-100 dark:bg-white/10 z-0"></div>
        )}

        <div className="relative z-10 w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-3 shadow-sm group-hover:border-blue-500/30 transition-all duration-300">
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                {stepNumber}
            </div>
            <Icon className="w-6 h-6 text-blue-600" />
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[150px]">
            {description}
        </p>

        {/* Connector (Mobile) */}
        {!isLast && (
            <div className="lg:hidden w-[1px] h-6 bg-slate-100 dark:bg-white/10 my-3"></div>
        )}
    </div>
);

const HowItWorksIndex = () => {
    const steps = [
        {
            icon: Wallet,
            title: "Invest Money",
            description: "Choose your investment amount (min $5,000)",
        },
        {
            icon: TrendingUp,
            title: "We Invest",
            description: "Our experts invest in carefully selected opportunities",
        },
        {
            icon: Calendar,
            title: "Weekly Returns",
            description: "Receive 2-5% returns credited every Friday",
        },
        {
            icon: ArrowDownCircle,
            title: "Withdraw Anytime",
            description: "Request withdrawal of principal + returns anytime",
        },
    ];

    return (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight text-center sm:text-left">
                How Your Investment Works
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-center">
                {steps.map((step, index) => (
                    <Step
                        key={index}
                        {...step}
                        stepNumber={index + 1}
                        isLast={index === steps.length - 1}
                    />
                ))}
            </div>
        </section>
    );
};

export default HowItWorksIndex;
