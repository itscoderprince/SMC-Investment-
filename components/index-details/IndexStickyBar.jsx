"use client";

import { useState, useEffect } from "react";
import { Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const IndexStickyBar = ({ name, returns, onInvest }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showQuickCalc, setShowQuickCalc] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 600) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                    >
                        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Focusing on</p>
                                    <p className="font-black text-slate-900 dark:text-white">{name}</p>
                                </div>
                                <div className="h-10 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Weekly Return</p>
                                    <p className="font-black text-emerald-500">{returns}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button onClick={onInvest} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full px-8 h-12 shadow-lg shadow-blue-500/20">
                                    Invest Now
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default IndexStickyBar;
