"use client";

import { Infinity } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-svh flex flex-col items-center justify-center p-6 md:p-10 bg-muted/30 dark:bg-[#020617]">
            <div className="w-full max-w-sm md:max-w-md space-y-8">
                <div className="flex justify-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-blue-600 text-white flex size-10 items-center justify-center rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Infinity className="size-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">SMC</span>
                    </Link>
                </div>

                <div className="w-full">
                    {children}
                </div>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} SMC
                </p>
            </div>
        </div>
    );
}
