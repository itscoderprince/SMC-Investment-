"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    ArrowRight,
    TrendingUp,
    Users,
    DollarSign,
    BarChart3,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

/* ─── animated counter hook — starts AFTER hydration, not on load ─── */
function useCounter(end, duration = 2000, suffix = "") {
    const [value, setValue] = useState(end); // Start at final value for SSR/LCP
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        // Defer counters until after the page is interactive — don't block LCP
        const raf = requestAnimationFrame(() => {
            setValue(0);
            const startTime = performance.now();
            const tick = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out: fastest at start, slows at end
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.floor(eased * end));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });

        return () => cancelAnimationFrame(raf);
    }, [end, duration]);

    return value.toLocaleString("en-IN") + suffix;
}

/* ─── mini candlestick chart — deferred, non-blocking ─── */
function TradingCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let animationId;
        let offset = 0;
        let isRunning = false;

        // Pre-generate candle data once
        const candles = [];
        let price = 150;
        for (let i = 0; i < 40; i++) { // Reduced from 60 to 40 candles
            const open = price;
            const change = (Math.random() - 0.42) * 12;
            const close = open + change;
            candles.push({
                open,
                close,
                high: Math.max(open, close) + Math.random() * 6,
                low: Math.min(open, close) - Math.random() * 6,
            });
            price = close;
        }

        // Pre-compute min/max once (not every frame)
        const allPrices = candles.flatMap((c) => [c.high, c.low]);
        const minP = Math.min(...allPrices) - 10;
        const maxP = Math.max(...allPrices) + 10;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // No scale(2,2) — avoid double-resolution draw cost
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        const draw = () => {
            if (!isRunning || document.visibilityState === "hidden") {
                animationId = requestAnimationFrame(draw);
                return;
            }

            const ctx = canvas.getContext("2d");
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const toY = (p) => h - ((p - minP) / (maxP - minP)) * h * 0.8 - h * 0.1;
            const candleW = w / candles.length;

            // Draw candles (no shadow — shadow is GPU-expensive)
            candles.forEach((c, i) => {
                const x = i * candleW + candleW / 2;
                const bullish = c.close >= c.open;
                const color = bullish ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.5)";

                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, toY(c.high));
                ctx.lineTo(x, toY(c.low));
                ctx.stroke();

                ctx.fillStyle = color;
                const bodyTop = toY(Math.max(c.open, c.close));
                const bodyH = Math.max(toY(Math.min(c.open, c.close)) - bodyTop, 1);
                ctx.fillRect(x - candleW * 0.28, bodyTop, candleW * 0.56, bodyH);
            });

            // Moving average line — NO shadowBlur (expensive GPU op)
            offset += 0.25;
            ctx.beginPath();
            ctx.strokeStyle = "rgba(59,130,246,0.45)";
            ctx.lineWidth = 1.5;
            const sw = 4;
            for (let i = sw; i < candles.length; i++) {
                let avg = 0;
                for (let j = 0; j < sw; j++) avg += candles[i - j].close;
                avg /= sw;
                const x = i * candleW + candleW / 2;
                const y = toY(avg) + Math.sin((i + offset) * 0.25) * 1.5;
                i === sw ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            animationId = requestAnimationFrame(draw);
        };

        // IntersectionObserver: only animate when visible
        const observer = new IntersectionObserver(
            ([entry]) => {
                isRunning = entry.isIntersecting;
                if (isRunning && !animationId) draw();
            },
            { threshold: 0.1 }
        );
        observer.observe(canvas);

        return () => {
            isRunning = false;
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-30"
        />
    );
}

/* ─── stat card ─── */
function StatCard({ icon: Icon, value, label, color }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-500/30 hover:bg-white/[0.06] transition-colors duration-300">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
                <div className="text-lg font-bold text-white tracking-tight">{value}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{label}</div>
            </div>
        </div>
    );
}

/* ─── live badge — static, no animation cost ─── */
function LiveBadge() {
    return (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.15em]">
                Live Trading Platform
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                          HERO                                  */
/* ═══════════════════════════════════════════════════════════════ */
const Hero = () => {
    const usersCount = useCounter(5000, 2000, "+");
    const portfolioCount = useCounter(10, 1800, " Cr+");
    const returnRate = useCounter(126, 2000, "%");
    const secureTx = useCounter(25000, 2200, "+");
    const { isAuthenticated, user } = useAuthStore();

    const getDashboardLink = useCallback(() => {
        if (!isAuthenticated) return "/register";
        return user?.role === "admin" || user?.role === "master_admin"
            ? "/admin/dashboard"
            : "/dashboard";
    }, [isAuthenticated, user]);

    return (
        <section className="relative min-h-[100vh] flex items-center pt-28 pb-24 overflow-hidden bg-[#020617]">
            {/* ── background layers — simplified, NO blur-[120px] (paint bottleneck) ── */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {/* Replaced expensive blur-[120px] with lighter opacity gradient */}
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/8 rounded-full" style={{ filter: "blur(80px)" }} />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/6 rounded-full" style={{ filter: "blur(70px)" }} />
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_50%,transparent_100%)]" />
            </div>

            {/* Candlestick canvas — lazy, only draws when in viewport */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <TradingCanvas />
            </div>

            <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* ── LEFT: Content ── */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <LiveBadge />

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
                            Welcome to your{" "}
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
                                Financial Journey.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-xl leading-relaxed font-medium">
                            Where we offer superior returns, complete transparency, and the
                            latest investing technology. Your investments will be safe on the
                            SMC platform. Join today and shape your future!
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button
                                asChild
                                size="lg"
                                aria-label="Start your financial journey and start investing"
                                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-base font-bold shadow-[0_0_24px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] duration-300"
                            >
                                <Link href={getDashboardLink()}>
                                    Start Investing
                                    <ArrowRight aria-hidden="true" className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-base font-bold text-slate-300 hover:text-white transition-colors duration-200"
                            >
                                <Link href="#indices">View Live Index</Link>
                            </Button>
                        </div>

                        {/* Trust stat row */}
                        <div className="mt-12 flex items-center gap-3">
                            <div className="flex -space-x-2" aria-hidden="true">
                                {["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"].map(
                                    (bg, i) => (
                                        <div
                                            key={i}
                                            className={`h-9 w-9 rounded-full border-2 border-[#020617] ${bg} flex items-center justify-center text-white text-[10px] font-bold`}
                                        >
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="text-sm text-slate-400">
                                <span className="text-white font-bold">{usersCount}</span>{" "}
                                Active Users trust SMC
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Stats dashboard ── */}
                    <div className="relative hidden lg:flex flex-col gap-5">
                        {/* Chart card — removed blur-3xl glow (paint cost) */}
                        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                                        Portfolio Growth
                                    </p>
                                    <p className="text-2xl font-black text-white mt-1">
                                        +{returnRate}{" "}
                                        <span className="text-sm font-medium text-emerald-400">
                                            Annual Return
                                        </span>
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" aria-hidden="true" />
                                </div>
                            </div>

                            {/* Static SVG chart — no canvas, no animation cost */}
                            <svg viewBox="0 0 400 100" className="w-full h-24" preserveAspectRatio="none" aria-hidden="true">
                                <defs>
                                    <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                                        <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0 80 Q30 70 60 65 T120 50 T180 55 T240 35 T300 30 T360 20 T400 10"
                                    fill="none"
                                    stroke="rgba(16,185,129,0.8)"
                                    strokeWidth="2.5"
                                />
                                <path
                                    d="M0 80 Q30 70 60 65 T120 50 T180 55 T240 35 T300 30 T360 20 T400 10 L400 100 L0 100 Z"
                                    fill="url(#heroChartGrad)"
                                />
                            </svg>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard icon={Users} value={usersCount} label="Active Users" color="bg-blue-500/10 text-blue-400" />
                            <StatCard icon={DollarSign} value={`$${portfolioCount}`} label="Portfolio Managed" color="bg-emerald-500/10 text-emerald-400" />
                            <StatCard icon={BarChart3} value={secureTx} label="Transactions" color="bg-violet-500/10 text-violet-400" />
                            <StatCard icon={ShieldCheck} value="100%" label="Secure & Verified" color="bg-amber-500/10 text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" aria-hidden="true" />
        </section>
    );
};

export default Hero;
