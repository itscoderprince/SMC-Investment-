"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Wallet,
    TrendingUp,
    Coins,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    ChevronRight,
    ExternalLink,
    Clock,
    CheckCircle2,
    Zap,
    Home,
    LayoutDashboard,
    Loader2,
    Users,
    Gift,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboard } from "@/hooks/useApi";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

// Stats Card Component
function StatsCard({ icon: Icon, iconColor, title, amount, subtext, trend, trendUp }) {
    // Extract themes from color reference
    const isGreen = iconColor.includes('green') || iconColor.includes('emerald');
    const isPurple = iconColor.includes('purple') || iconColor.includes('violet');
    const isAmber = iconColor.includes('amber') || iconColor.includes('orange');
    const isBlue = iconColor.includes('blue');
    
    // Solid backgrounds matched to pill capsules from your screenshot
    const pillBg = isGreen ? 'bg-[#10b981]' : 
                   isPurple ? 'bg-[#7c3aed]' : 
                   isAmber ? 'bg-[#f59e0b]' : 
                   isBlue ? 'bg-[#2563eb]' : 'bg-slate-900';

    // Mini Static SVG Line Paths that look like elegant stock charts
    const sparklinePaths = [
        "M0 25C10 15 15 30 25 25C35 20 40 5 50 15C60 25 65 10 75 20C85 30 90 15 100 5",
        "M0 35C15 25 25 30 35 15C45 0 55 30 65 15C75 0 85 20 100 10",
        "M0 20C10 10 20 25 30 15C40 5 50 30 60 20C70 10 80 25 90 10C95 5 100 15 100 5"
    ];
    
    // Generate pseudo-symbol from Title (e.g. Total Invested -> TIN)
    const generateSymbol = (str) => {
        const parts = str.split(' ');
        if(parts.length > 1) return parts.map(p => p[0]).join('').toUpperCase().substring(0, 4);
        return str.substring(0, 3).toUpperCase();
    };

    const symbol = generateSymbol(title);
    // Pick distinct static path based on title string code so it remains consistent
    const path = sparklinePaths[title.charCodeAt(0) % sparklinePaths.length];
    
    // Color for sparklines, default to green unless explicitly told it is down
    const sparklineStroke = (trendUp === false) ? "#ef4444" : "#22c55e";

    return (
        <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group bg-white">
            <CardContent className="p-4 relative z-10 flex flex-col h-full min-h-[120px] justify-between">
                {/* Top Row Layout - matches screenshot exactly */}
                <div className="flex justify-between items-start mb-4">
                    {/* Left: Capsule/Pill Wrapper for the Stat + Icon */}
                    <div className={cn("flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white shadow-sm transition-transform group-hover:scale-[1.02]", pillBg)}>
                        <div className="bg-white/20 p-1 rounded-full shrink-0">
                            <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] font-black tracking-tight leading-none">{title}.Inc</span>
                    </div>

                    {/* Right: Display Symbol and Change Percentage */}
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-900 tracking-widest uppercase">{symbol}</span>
                        {trend ? (
                            <span className={cn("text-[10px] font-bold tracking-tight leading-none mt-0.5", trendUp ? "text-[#22c55e]" : "text-[#ef4444]")}>
                                {trendUp ? '+' : '-'}{trend}
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold tracking-tight leading-none mt-0.5 text-[#22c55e]">+0.00%</span>
                        )}
                    </div>
                </div>

                {/* Bottom Row Layout - matches screenshot exactly */}
                <div className="flex justify-between items-end">
                    {/* Bottom Left: Large formatted Value */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Portfolio</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight leading-none">{amount}</span>
                    </div>

                    {/* Bottom Right: Handcrafted static sparkline for "Wow" Visual Aesthetics */}
                    <div className="w-20 h-10 mb-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        <svg width="100%" height="100%" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path 
                                d={path} 
                                stroke={sparklineStroke} 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="drop-shadow-[0_2px_3px_rgba(34,197,94,0.2)]"
                            />
                        </svg>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Simple Bar Chart Component
function ReturnsChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <Card className="border-none shadow-sm h-full">
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground text-sm">No returns data yet</p>
                </CardContent>
            </Card>
        );
    }

    const maxValue = Math.max(...data.map((d) => d.value));

    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xs font-bold text-foreground">Returns Growth</CardTitle>
                        <CardDescription className="text-[9px]">Weekly profit performance</CardDescription>
                    </div>
                    <Link href="/investments" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                        Analytics
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="flex items-end justify-between gap-1 h-28 mt-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="w-full max-w-[12px] bg-gradient-to-t from-primary to-primary/80 rounded-full transition-all duration-300 hover:scale-x-125 cursor-pointer"
                                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent className="text-[10px] bg-popover text-popover-foreground border border-border py-1 px-2">
                                        ${item.value.toLocaleString()}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase">{item.week}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const { user, setUser } = useAuthStore();
    const kycStatus = user?.kycStatus;
    const { data: dashboardData, loading, error } = useDashboard();

    // Sync user data from dashboard API to auth store to prevent stale data
    useEffect(() => {
        if (dashboardData?.user && user) {
            // Only update if there are actual changes to prevent unnecessary re-renders
            if (dashboardData.user.kycStatus !== user.kycStatus) {
                setUser({
                    ...user,
                    kycStatus: dashboardData.user.kycStatus,
                    isEmailVerified: dashboardData.user.isEmailVerified
                });
            }
        }
    }, [dashboardData, user, setUser]);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load dashboard</p>
                    <p className="text-sm text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    const summary = dashboardData?.summary || {};
    const pendingItems = dashboardData?.pendingItems || {};
    const recentInvestments = dashboardData?.recentInvestments || [];

    const stats = [
        {
            icon: Zap,
            iconColor: "bg-blue-600",
            title: "Total Invested",
            amount: `$${(summary.totalInvested || 0).toLocaleString()}`,
            subtext: `Across ${summary.activeInvestmentsCount || 0} active investments`,
            trend: null,
            trendUp: true,
        },
        {
            icon: TrendingUp,
            iconColor: "bg-green-600",
            title: "Total Returns",
            amount: `$${(summary.totalReturns || 0).toLocaleString()}`,
            subtext: `${((summary.totalReturns / (summary.totalLifetimeInvested || 1)) * 100).toFixed(1)}% overall ROI`,
            trend: (summary.totalReturns || 0) > 0 ? `+${((summary.totalReturns / (summary.totalLifetimeInvested || 1)) * 100).toFixed(1)}%` : null,
            trendUp: true,
        },
        {
            icon: Coins,
            iconColor: "bg-purple-600",
            title: "Wallet Balance",
            amount: `$${(summary.walletBalance || 0).toLocaleString()}`,
            subtext: "Available for withdrawal",
            trend: null,
        },
        {
            icon: Zap,
            iconColor: "bg-amber-600",
            title: "Monthly Bonus",
            amount: `$${(summary.accumulationBonus || 0).toLocaleString()}`,
            subtext: "Accumulated this month",
            trend: null,
        },
        {
            icon: Activity,
            iconColor: "bg-orange-600",
            title: "Active Investments",
            amount: summary.activeInvestmentsCount || 0,
            subtext: `$${(summary.currentValue || 0).toLocaleString()} current value`,
            trend: null,
        },
    ];

    // Transform recent investments for display
    const investments = recentInvestments.map(inv => ({
        id: inv._id,
        name: inv.index?.name || 'Unknown Index',
        amount: `$${(inv.amount || 0).toLocaleString()}`,
        weeklyReturn: `$${(inv.lastWeekReturn || 0).toLocaleString()}`,
        totalEarned: `$${(inv.totalReturns || 0).toLocaleString()}`,
        status: inv.status === 'active' ? 'Active' : inv.status === 'pending' ? 'Pending' : 'Completed',
        risk: inv.index?.riskLevel || 'medium',
    }));

    // Dynamic chart data from API
    const chartData = dashboardData?.chartData || [];

    // Use KYC status from dashboard API (fresh data) instead of auth store (potentially stale)
    const currentKycStatus = dashboardData?.user?.kycStatus || kycStatus;
    const showKycAlert = currentKycStatus !== 'approved';

    return (
        <div className="space-y-4 w-full pt-0 pb-2 md:pb-4 px-2 md:px-1">
            {/* Header with Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                <div>
                    <h1 className="text-lg font-black text-foreground tracking-tight">Welcome back, {user?.name?.split(" ")[0]}!</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-xs font-bold shadow-md shadow-primary/20 px-4">
                        <Link href="/invest">
                            <Zap className="w-3.5 h-3.5 mr-2" />
                            Invest Now
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs font-bold border-input px-4">
                        <Link href="/withdraw">
                            <Wallet className="w-3.5 h-3.5 mr-2" />
                            Withdraw
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KYC Alert */}
            {showKycAlert && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-700 tracking-tight">
                                {currentKycStatus === 'pending' ? 'KYC Under Review' : currentKycStatus === 'rejected' ? 'KYC Rejected' : 'KYC Verification Required'}
                            </p>
                            <p className="text-[11px] text-amber-600/80">
                                {currentKycStatus === 'pending'
                                    ? 'Your documents are being reviewed. This usually takes 24-48 hours.'
                                    : currentKycStatus === 'rejected'
                                        ? 'Please resubmit your documents with correct information.'
                                        : 'Submit your documents to unlock full withdrawal limits.'}
                            </p>
                        </div>
                    </div>
                    {currentKycStatus !== 'pending' && (
                        <Button asChild variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-500/20 font-bold text-xs shrink-0">
                            <Link href="/kyc">{currentKycStatus === 'rejected' ? 'Resubmit' : 'Complete Now'}</Link>
                        </Button>
                    )}
                </div>
            )}

            {/* Pending Items Alert */}
            {(pendingItems.payments > 0 || pendingItems.withdrawals > 0) && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary tracking-tight">Pending Actions</p>
                            <p className="text-[11px] text-primary/80">
                                {pendingItems.payments > 0 && `${pendingItems.payments} payment(s) awaiting confirmation. `}
                                {pendingItems.withdrawals > 0 && `${pendingItems.withdrawals} withdrawal(s) processing.`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
                {/* Active Investments */}
                <Card className="xl:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b flex flex-row items-center justify-between py-2 md:py-3.5 px-4 md:px-6">
                        <div className="flex flex-col gap-0.5">
                            <CardTitle className="text-sm md:text-base font-bold text-foreground tracking-tight">Active Portfolios</CardTitle>
                            <CardDescription className="text-[10px] md:text-xs text-muted-foreground font-medium">Real-time tracking of your capital</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-bold text-primary h-8" asChild>
                            <Link href="/investments">View All</Link>
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        {investments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Activity className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground mb-1">No Active Portfolios</h3>
                                <p className="text-xs text-muted-foreground mb-6">You haven't made any investments yet.</p>
                                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20">
                                    <Link href="/invest">
                                        <Zap className="w-4 h-4 mr-2" />
                                        Start Investing
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 border-b border-border hover:bg-transparent">
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-6 h-10">Asset & Risk</TableHead>
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-10">Amount</TableHead>
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-10 text-center">Returns</TableHead>
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-10">Status</TableHead>
                                        <TableHead className="text-right px-6 h-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {investments.map((inv) => (
                                        <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors border-b border-border last:border-0 group">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-black text-foreground">{inv.name}</p>
                                                    <Badge variant="outline" className={`w-fit text-[8px] font-black uppercase tracking-widest px-1.5 py-0 ${inv.risk === 'low' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : inv.risk === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                        {inv.risk === 'low' ? <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> : <AlertTriangle className="w-2.5 h-2.5 mr-1" />}
                                                        {inv.risk} Risk
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm font-black text-foreground whitespace-nowrap">{inv.amount}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">{inv.totalEarned}</span>
                                                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Total Earned</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${inv.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm shadow-emerald-500/10' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm shadow-amber-500/10'}`}>
                                                    {inv.status === 'Active' && <Activity className="w-3 h-3 mr-1" />}
                                                    {inv.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors" asChild>
                                                    <Link href={`/investments/${inv.id}`}>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </Card>

                {/* Growth Chart & Support */}
                <div className="space-y-6">
                    <ReturnsChart data={chartData} />

                    {/* Referral Invite Card */}
                    <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Gift className="w-24 h-24 -mr-6 -mt-6" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-xs font-bold">Refer & Earn</CardTitle>
                            <CardDescription className="text-[9px] text-primary-foreground/90">Invite friends and get 5% bonus</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[10px] text-primary-foreground/80 uppercase font-bold">Bonus Earned</p>
                                    <p className="text-xl font-black">${(user?.referralBonusEarned || 0).toLocaleString()}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <Button asChild size="sm" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-[10px] uppercase h-8 rounded-lg">
                                <Link href="/referrals">Invite Friends</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
