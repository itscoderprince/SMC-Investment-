"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useIndices } from "@/hooks/useApi";

const Ticker = () => {
    const { indices: apiIndices } = useIndices({ limit: 10 });

    const items = apiIndices && apiIndices.length > 0
        ? apiIndices.map(index => ({
            name: `${index.name.toUpperCase()}`,
            price: `${index.currentReturnRate}%`,
            change: "+0.00%", // We can implement actual logic later if needed
            up: true
        }))
        : [];

    // Double the items for seamless loop
    const displayItems = [...items, ...items];

    return (
        <section className="w-full bg-[#020617] border-y border-white/5 relative z-20 overflow-hidden select-none">
            <div className="flex whitespace-nowrap py-3 md:py-4 animate-ticker">
                {displayItems.map((item, index) => (
                    <div
                        key={index}
                        className="inline-flex items-center gap-4 md:gap-8 px-8 md:px-12 border-r border-white/5 last:border-0"
                    >
                        <span className="text-emerald-500/50 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">
                            {item.name}
                        </span>
                        <span className="text-white font-mono text-xs md:text-sm font-bold">
                            {item.price}
                        </span>
                        <div
                            className={`flex items-center gap-1 text-[10px] md:text-xs font-black px-2 py-0.5 rounded-md ${item.up
                                ? "text-emerald-400 bg-emerald-500/10"
                                : "text-rose-400 bg-rose-500/10"
                                }`}
                        >
                            {item.up ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {item.change}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Ticker;
