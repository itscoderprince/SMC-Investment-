"use client";

import { useEffect, useRef, useState } from "react";
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

/* ─── animated counter hook ─── */
function useCounter(end, duration = 2000, suffix = "") {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                start = end;
                clearInterval(timer);
            }
            setValue(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);
    return value.toLocaleString("en-IN") + suffix;
}

/* ─── mini candlestick chart (canvas) ─── */
function TradingCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animationId;
        let offset = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);
        };
        resize();
        window.addEventListener("resize", resize);

        // Generate candle data
        const candles = [];
        let price = 150;
        for (let i = 0; i < 60; i++) {
            const open = price;
            const change = (Math.random() - 0.42) * 12;
            const close = open + change;
            const high = Math.max(open, close) + Math.random() * 6;
            const low = Math.min(open, close) - Math.random() * 6;
            candles.push({ open, close, high, low });
            price = close;
        }

        const draw = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);

            const allPrices = candles.flatMap((c) => [c.high, c.low]);
            const minP = Math.min(...allPrices) - 10;
            const maxP = Math.max(...allPrices) + 10;
            const toY = (p) => h - ((p - minP) / (maxP - minP)) * h * 0.8 - h * 0.1;

            const candleW = w / candles.length;

            // Draw grid lines
            ctx.strokeStyle = "rgba(59,130,246,0.06)";
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const y = (h / 6) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Draw candles
            candles.forEach((c, i) => {
                const x = i * candleW + candleW / 2;
                const bullish = c.close >= c.open;
                const color = bullish ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.6)";

                // Wick
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, toY(c.high));
                ctx.lineTo(x, toY(c.low));
                ctx.stroke();

                // Body
                ctx.fillStyle = color;
                const bodyTop = toY(Math.max(c.open, c.close));
                const bodyBot = toY(Math.min(c.open, c.close));
                const bodyH = Math.max(bodyBot - bodyTop, 1);
                ctx.fillRect(x - candleW * 0.3, bodyTop, candleW * 0.6, bodyH);
            });

            // Animated glowing line overlay (moving average)
            offset += 0.3;
            ctx.beginPath();
            ctx.strokeStyle = "rgba(59,130,246,0.5)";
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(59,130,246,0.4)";
            ctx.shadowBlur = 8;
            const smoothWindow = 5;
            for (let i = smoothWindow; i < candles.length; i++) {
                let avg = 0;
                for (let j = 0; j < smoothWindow; j++) avg += candles[i - j].close;
                avg /= smoothWindow;
                const x = i * candleW + candleW / 2;
                const y = toY(avg) + Math.sin((i + offset) * 0.3) * 2;
                i === smoothWindow ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-40"
        />
    );
}

/* ─── floating particles ─── */
function Particles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-blue-400/30"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `float ${6 + Math.random() * 8}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-40px) scale(1.5); opacity: 0.8; }
        }
      `}</style>
        </div>
    );
}

/* ─── stat card ─── */
function StatCard({ icon: Icon, value, label, color, delay }) {
    return (
        <div
            className="relative group flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:border-blue-500/30 hover:bg-white/[0.06] transition-all duration-500"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-lg font-bold text-white tracking-tight">
                    {value}
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                    {label}
                </div>
            </div>
        </div>
    );
}

/* ─── live ticker badge ─── */
function LiveBadge() {
    return (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
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
    const usersCount = useCounter(5000, 2200, "+");
    const portfolioCount = useCounter(10, 1800, " Cr+");
    const returnRate = useCounter(126, 2000, "%");
    const secureTx = useCounter(25000, 2400, "+");
    const { isAuthenticated, user } = useAuthStore();

    const getDashboardLink = () => {
        if (!isAuthenticated) return "/register";
        return user?.role === "admin" || user?.role === "master_admin"
            ? "/admin/dashboard"
            : "/dashboard";
    };

    return (
        <section className="relative min-h-[100vh] flex items-center pt-28 pb-24 overflow-hidden bg-[#020617]">
            {/* ── background layers ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* radial glow */}
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[100px]" />
                {/* grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_50%,transparent_100%)]" />
            </div>

            {/* Candlestick background */}
            <div className="absolute inset-0 pointer-events-none">
                <TradingCanvas />
            </div>

            <Particles />

            <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* ── LEFT: Content ── */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <LiveBadge />

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Welcome to your{" "}
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
                                Financial Journey.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-xl leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Where we offer superior returns, complete transparency, and the
                            latest investing technology. Your investments will be safe on the
                            SMC platform. Join today and shape your future!
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-base font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.45)] transition-all hover:scale-[1.02] duration-300"
                            >
                                <Link href={getDashboardLink()}>
                                    Start Investing
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-base font-bold text-slate-300 hover:text-white transition-all backdrop-blur-sm"
                            >
                                <Link href="#indices">View Live Index</Link>
                            </Button>
                        </div>

                        {/* Trust stat row */}
                        <div className="mt-12 flex items-center gap-3 animate-in fade-in delay-500">
                            <div className="flex -space-x-2">
                                {["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"].map(
                                    (bg, i) => (
                                        <div
                                            key={i}
                                            className={`h-9 w-9 rounded-full border-2 border-[#020617] ${bg} shadow-lg flex items-center justify-center text-white text-[10px] font-bold`}
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
                    <div className="relative hidden lg:flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        {/* Floating chart card */}
                        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 overflow-hidden">
                            {/* Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
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
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                </div>
                            </div>

                            {/* Mini chart SVG */}
                            <svg
                                viewBox="0 0 400 100"
                                className="w-full h-24"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient
                                        id="heroChartGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
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
                            <StatCard
                                icon={Users}
                                value={usersCount}
                                label="Active Users"
                                color="bg-blue-500/10 text-blue-400"
                                delay={400}
                            />
                            <StatCard
                                icon={DollarSign}
                                value={`$${portfolioCount}`}
                                label="Portfolio Managed"
                                color="bg-emerald-500/10 text-emerald-400"
                                delay={500}
                            />
                            <StatCard
                                icon={BarChart3}
                                value={secureTx}
                                label="Transactions"
                                color="bg-violet-500/10 text-violet-400"
                                delay={600}
                            />
                            <StatCard
                                icon={ShieldCheck}
                                value="100%"
                                label="Secure & Verified"
                                color="bg-amber-500/10 text-amber-400"
                                delay={700}
                            />
                        </div>

                        {/* Floating accent elements */}
                        <div className="absolute -top-6 -right-6 w-20 h-20 border border-blue-500/20 rounded-2xl rotate-12 animate-pulse" />
                        <div className="absolute -bottom-4 -left-4 w-14 h-14 border border-emerald-500/15 rounded-xl -rotate-6 animate-pulse delay-1000" />
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
        </section>
    );
};

export default Hero;
