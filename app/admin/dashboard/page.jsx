"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
    Users,
    TrendingUp,
    Clock,
    DollarSign,
    FileCheck,
    CreditCard,
    Wallet,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight,
    Home,
    ShieldCheck,
    RefreshCw,
    MoreHorizontal,
    Eye,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Check,
    X,
    Filter,
    Download
} from "lucide-react";

// Breadcrumb imports removed as AdminLayout handles it

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Pie,
    PieChart,
    Label,
    Cell,
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

import { useAdminDashboard } from "@/hooks/useApi";

const quickActions = [
    { icon: FileCheck, label: "Approve KYC", color: "bg-blue-600 hover:bg-blue-700", href: "/admin/kyc" },
    { icon: CreditCard, label: "Payments", color: "bg-green-600 hover:bg-green-700", href: "/admin/payments" },
    { icon: DollarSign, label: "Returns", color: "bg-purple-600 hover:bg-purple-700", href: "/admin/returns" },
    { icon: MessageSquare, label: "Tickets", color: "bg-orange-500 hover:bg-orange-600", href: "/admin/tickets" },
];

export default function AdminDashboardPage() {
    // 1. DATA FETCHING (POWERED BY REACT QUERY)
    // useAdminDashboard automatically handles API requests and background caching.
    // By extracting 'data', 'loading', and 'refetch', we keep UI code clean.
    const { data, loading, error, refetch } = useAdminDashboard();
    
    // 2. LOCAL UI STATE
    // This state purely controls the spinning animation of the refresh button.
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 3. ACTION HANDLERS
    // Wraps the generic refetch function with visual loading cues
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 animate-pulse"></div>
                    <RefreshCw className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="p-4 bg-red-50 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm font-bold text-red-500">Unable to load dashboard data</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
            </div>
        );
    }

    // safely deconstruct data with fallbacks
    const {
        overview = { totalUsers: 0, activeUsers: 0, activeInvestments: 0, totalInvested: 0, totalReturns: 0 },
        pending = { kyc: 0, payments: 0, withdrawals: 0, tickets: 0 },
        recentUsers = [],
        activities = [],
        distribution = [],
        growth = [],
        trends = { users: { value: 0, isPositive: true }, investments: { value: 0, isPositive: true }, returns: { value: 0, isPositive: true } }
    } = data || {};

    const chartConfig = data?.chartConfig || {
        value: { label: "Percentage" },
    };

    // Format Data for Charts
    const growthChartData = growth.map(g => ({
        month: g.month,
        users: g.users
    }));

    const recentActivity = activities.slice(0, 10).map(a => ({
        id: a.id,
        user: a.user,
        email: a.email,
        action: a.description || a.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        amount: a.metadata?.amount ? `${a.metadata.currency || '$'}${Number(a.metadata.amount).toLocaleString()}` : '—',
        status: a.status === 'success' ? 'approved' : a.status === 'failure' ? 'rejected' : 'pending',
        date: new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: a.action
    }));

    const statsData = [
        {
            title: "Total Users",
            value: overview.totalUsers.toLocaleString(),
            subValue: overview.activeUsers,
            subLabel: "active",
            trend: `${trends?.users?.value || 0}%`,
            trendUp: trends?.users?.isPositive ?? true,
            icon: Users,
            color: "blue",
        },
        {
            title: "Investments",
            value: `$${(overview.totalInvested || 0).toLocaleString()}`,
            subValue: overview.activeInvestments,
            subLabel: "active",
            trend: `${trends?.investments?.value || 0}%`,
            trendUp: trends?.investments?.isPositive ?? true,
            icon: TrendingUp,
            color: "green",
        },
        {
            title: "Returns",
            value: `$${(overview.totalReturns || 0).toLocaleString()}`,
            subValue: "Lifetime",
            subLabel: "distributed",
            trend: `${trends?.returns?.value || 0}%`,
            trendUp: trends?.returns?.isPositive ?? true,
            icon: DollarSign,
            color: "purple",
        },
        {
            title: "Pending Tasks",
            value: (pending.kyc + pending.payments + pending.withdrawals).toString(),
            subValue: pending.tickets,
            subLabel: "tickets",
            trend: null,
            trendUp: false,
            icon: Clock,
            color: "orange",
        },
    ];

    const pendingItems = [
        { icon: FileCheck, color: "text-orange-600", bg: "bg-orange-50", title: "KYC Pending", count: pending.kyc, href: "/admin/kyc" },
        { icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", title: "Payments", count: pending.payments, href: "/admin/payments" },
        { icon: Wallet, color: "text-purple-600", bg: "bg-purple-50", title: "Withdrawals", count: pending.withdrawals, href: "/admin/withdrawals" },
        { icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50", title: "Tickets", count: pending.tickets, href: "/admin/tickets" },
    ];

    const totalCalculated = distribution.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="space-y-4 p-1 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-1">
                {/* Redundant breadcrumb removed here as AdminLayout handles global breadcrumbs */}
                <div></div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100 rounded-full"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            {/* Quick Actions Bar - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickActions.map((action) => (
                    <Link key={action.label} href={action.href} className="group">
                        <div className={`flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative`}>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${action.color} transition-transform group-hover:scale-110`}>
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{action.label}</span>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {statsData.map((stat, i) => (
                    <Card key={i} className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group">
                        <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <stat.icon className={`w-16 h-16 text-${stat.color}-600`} />
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                {stat.trend && (
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                        {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <span className="text-xs font-semibold text-gray-700">{stat.subValue}</span>
                                    <span className="text-[10px] text-gray-400 font-medium lowercase">{stat.subLabel}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Growth Chart */}
                <Card className="lg:col-span-2 border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between px-5 py-3 border-b border-gray-50">
                        <div>
                            <CardTitle className="text-sm font-bold text-gray-800">User Growth</CardTitle>
                            <CardDescription className="text-[10px] font-medium text-gray-400 mt-0.5">New user registrations over time</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1.5 text-gray-500 hover:text-gray-900">
                            <Download className="w-3 h-3" /> Export
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[250px] w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        dx={-10}
                                    />
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status/Pending Grid */}
                <div className="space-y-3">
                    {/* Investment Distribution Compact */}
                    {/* Investment Distribution - Shadcn Chart */}
                    <Card className="border-gray-100 shadow-sm flex flex-col h-[180px]">
                        <CardHeader className="px-4 py-2 border-b border-gray-50">
                            <CardTitle className="text-xs font-bold text-gray-700">Portfolio Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-0">
                            {distribution.length > 0 ? (
                                <div className="flex items-center w-full px-4 gap-4">
                                    <div className="h-24 w-24 shrink-0 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={distribution}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={30}
                                                    outerRadius={45}
                                                    strokeWidth={2}
                                                    stroke="#fff"
                                                >
                                                    {distribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="text-center">
                                                <p className="text-[9px] font-bold text-gray-400">Total</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1.5 h-24 overflow-y-auto pr-1 small-scrollbar">
                                        {distribution.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between text-[10px]">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-gray-600 truncate max-w-[80px]" title={item.name}>{item.name}</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <div className="h-24 w-24 rounded-full border-4 border-gray-100 flex items-center justify-center mb-2">
                                        <DollarSign className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-[10px] font-medium">No investment data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-2">
                        {pendingItems.map((item, i) => (
                            <Link key={i} href={item.href}>
                                <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm hover:border-gray-200 hover:shadow-md transition-all group h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-1.5 rounded-md ${item.bg}`}>
                                            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                        </div>
                                        {item.count > 0 && (
                                            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-100 px-1 text-[9px] font-bold text-red-600">
                                                {item.count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">{item.title}</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5 group-hover:text-blue-600 transition-colors">
                                        {item.count || 0} <span className="text-[10px] font-normal text-gray-400 ml-0.5">pending</span>
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-2">
                        <div className="bg-white p-1 rounded-md border border-gray-100 shadow-sm">
                            <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <CardTitle className="text-sm font-bold text-gray-800">Recent Activity</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5">
                            <Filter className="w-3 h-3" /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5">
                            <Download className="w-3 h-3" /> Export
                        </Button>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-[200px] h-8 text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-5">User</TableHead>
                                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-wider text-gray-500">Action</TableHead>
                                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-wider text-gray-500">Amount</TableHead>
                                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</TableHead>
                                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right pr-5">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentActivity.length > 0 ? (
                                recentActivity.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-blue-50/30 border-gray-50 group transition-colors">
                                        <TableCell className="py-2.5 pl-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.user}</span>
                                                <span className="text-[10px] text-gray-400">{item.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <span className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                {item.action}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <span className="text-xs font-bold text-gray-900">{item.amount}</span>
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <Badge
                                                variant="outline"
                                                className={`h-5 px-2 text-[10px] font-bold border-0 flex w-fit items-center gap-1 rounded-sm
                                                    ${item.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                                        item.status === "rejected" ? "bg-rose-50 text-rose-600" :
                                                            "bg-amber-50 text-amber-600"
                                                    }`}
                                            >
                                                {item.status === "approved" && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                {item.status === "rejected" && <XCircle className="w-2.5 h-2.5" />}
                                                {item.status === "pending" && <AlertCircle className="w-2.5 h-2.5" />}
                                                <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 text-right pr-5">
                                            <span className="text-[10px] font-medium text-gray-400">{item.date}</span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-xs text-gray-400">
                                        No recent activity found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
            <style jsx global>{`
                .small-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .small-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1; 
                }
                .small-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db; 
                    border-radius: 2px;
                }
                .small-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af; 
                }
            `}</style>
        </div>
    );
}
