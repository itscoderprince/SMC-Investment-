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


import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

// Stats Card Component
function StatsCard({ icon: Icon, iconColor, title, amount, subtext, trend, trendUp }) {
    const textColor = iconColor.replace('bg-', 'text-');
    const tintColor = iconColor.replace('bg-', 'bg-').replace('-600', '-50');

    return (
        <Card className="border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-0">
                <div className="p-3.5">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className={`w-9 h-9 rounded-xl ${tintColor} flex items-center justify-center shadow-sm`}>
                            <Icon className={`w-4.5 h-4.5 ${textColor}`} />
                        </div>
                        {trend && (
                            <Badge variant="outline" className={`${trendUp ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"} font-black text-[10px]`}>
                                {trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                {trend}
                            </Badge>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
                        <h3 className="text-lg md:text-xl font-black text-gray-900 mt-1 leading-none">{amount}</h3>
                        <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 opacity-70" />
                            {subtext}
                        </p>
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
                    <p className="text-gray-400 text-sm">No returns data yet</p>
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
                        <CardTitle className="text-xs font-bold text-gray-900">Returns Growth</CardTitle>
                        <CardDescription className="text-[9px]">Weekly profit performance</CardDescription>
                    </div>
                    <Link href="/investments" className="text-[10px] font-bold text-[#2563eb] hover:underline flex items-center gap-1">
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
                                            className="w-full max-w-[12px] bg-gradient-to-t from-[#2563eb] to-[#60a5fa] rounded-full transition-all duration-300 hover:scale-x-125 cursor-pointer"
                                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent className="text-[10px] bg-gray-900 text-white border-none py-1 px-2">
                                        ${item.value.toLocaleString()}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase">{item.week}</span>
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
        <div className="space-y-4 max-w-7xl mx-auto pt-0 pb-2 md:pb-4 px-2 md:px-1">
            {/* Header with Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
                                <Home className="w-3.5 h-3.5" />
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Dashboard
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-bold shadow-md shadow-blue-500/20 px-4">
                        <Link href="/invest">
                            <Zap className="w-3.5 h-3.5 mr-2" />
                            Invest Now
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs font-bold border-gray-200 px-4">
                        <Link href="/withdraw">
                            <Wallet className="w-3.5 h-3.5 mr-2" />
                            Withdraw
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KYC Alert */}
            {showKycAlert && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-yellow-800 tracking-tight">
                                {currentKycStatus === 'pending' ? 'KYC Under Review' : currentKycStatus === 'rejected' ? 'KYC Rejected' : 'KYC Verification Required'}
                            </p>
                            <p className="text-[11px] text-yellow-700/80">
                                {currentKycStatus === 'pending'
                                    ? 'Your documents are being reviewed. This usually takes 24-48 hours.'
                                    : currentKycStatus === 'rejected'
                                        ? 'Please resubmit your documents with correct information.'
                                        : 'Submit your documents to unlock full withdrawal limits.'}
                            </p>
                        </div>
                    </div>
                    {currentKycStatus !== 'pending' && (
                        <Button asChild variant="ghost" size="sm" className="text-yellow-800 hover:bg-yellow-100 font-bold text-xs shrink-0">
                            <Link href="/kyc">{currentKycStatus === 'rejected' ? 'Resubmit' : 'Complete Now'}</Link>
                        </Button>
                    )}
                </div>
            )}

            {/* Pending Items Alert */}
            {(pendingItems.payments > 0 || pendingItems.withdrawals > 0) && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-800 tracking-tight">Pending Actions</p>
                            <p className="text-[11px] text-blue-700/80">
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
                    <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between py-3">
                        <div>
                            <CardTitle className="text-xs font-bold text-gray-900">Active Portfolios</CardTitle>
                            <CardDescription className="text-[9px]">Real-time tracking of your capital</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-bold text-blue-600 h-8" asChild>
                            <Link href="/investments">View All</Link>
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        {investments.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500 mb-4">No investments yet</p>
                                <Button asChild size="sm" className="bg-[#2563eb]">
                                    <Link href="/invest">Start Investing</Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-white hover:bg-white border-b border-gray-100">
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 h-9">Asset</TableHead>
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-9">Amount</TableHead>
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-9 text-center">Returns</TableHead>
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-9">Status</TableHead>
                                        <TableHead className="text-right px-4 h-9"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {investments.map((inv) => (
                                        <TableRow key={inv.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0 h-14">
                                            <TableCell className="px-4">
                                                <div>
                                                    <p className="text-xs font-black text-gray-900">{inv.name}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 ${inv.risk === 'low' ? 'bg-green-50 text-green-700 border-green-100' : inv.risk === 'high' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                            {inv.risk === 'low' ? <CheckCircle2 className="w-2 h-2 mr-1" /> : <AlertTriangle className="w-2 h-2 mr-1" />}
                                                            {inv.risk} Risk
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-black text-gray-900 whitespace-nowrap">{inv.amount}</TableCell>
                                            <TableCell className="text-center">
                                                <p className="text-xs font-black text-green-600">{inv.totalEarned}</p>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Total Earned</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${inv.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                    {inv.status === 'Active' && <Activity className="w-2 h-2 mr-1" />}
                                                    {inv.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-4">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 transition-colors" asChild>
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
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Gift className="w-24 h-24 -mr-6 -mt-6" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-xs font-bold">Refer & Earn</CardTitle>
                            <CardDescription className="text-[9px] text-blue-100">Invite friends and get 5% bonus</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold">Bonus Earned</p>
                                    <p className="text-xl font-black">${(user?.referralBonusEarned || 0).toLocaleString()}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <Button asChild size="sm" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-[10px] uppercase h-8 rounded-lg">
                                <Link href="/referrals">Invite Friends</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
