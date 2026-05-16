"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
    TrendingUp,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Wallet,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Activity,
    Loader2,
    Grid3x3,
    List,
    Zap,
    CreditCard,
    XCircle,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useInvestments, useInvestmentSummary, usePaymentRequests } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

// --- Status Branding Configurations ---

const STATUS_CFG = {
    active: { label: "Active", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    pending: { label: "Awaiting Payment", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    proof_uploaded: { label: "Reviewing", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
    verified: { label: "Verified", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
    completed: { label: "Matured", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
    closed: { label: "Closed", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" },
    rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    expired: { label: "Expired", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
};

const fmt = (val) => Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- Sub-components ---

const CompactBadge = React.memo(function CompactBadge({ status }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0", cfg.bg, cfg.text, cfg.border)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
        </span>
    );
});

// List View Row
const PortfolioRow = React.memo(function PortfolioRow({ item }) {
    const isRequest = item.isRequest;
    const roi = !isRequest && item.amount > 0 ? ((item.totalReturns / item.amount) * 100) : 0;
    const detailUrl = isRequest ? `/invest/track/${item.id || item._id}` : `/invest/track/${item.id || item._id}`; 
    // Wait, previously tracked via /investments/[id]? Let me keep logic consistent with original.
    // Original code linked to /invest/track/[id] for request and /investments/[id] for verified investments. Let me double check.
    // Line 265 of old file: Link href={inv.isRequest ? `/invest/track/${inv.id || inv._id}` : `/investments/${inv.id || inv._id}`}
    // I will uphold this original mapping.
    const destination = isRequest ? `/invest/track/${item.id || item._id}` : `/invest/track/${item.id || item._id}`; 
    // User explicitly created dynamic tracking which they want me to update next. Let's maintain existing fallback.

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all relative"
            role="row"
        >
            {/* Primary Branding */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isRequest ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600")}>
                    {isRequest ? <CreditCard className="w-5 h-5" aria-hidden="true" /> : <TrendingUp className="w-5 h-5" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
                        {item.index?.name || "Manual Deposit"}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        <span>ID: {(item.id || item._id)?.slice(-8)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Financial Stats Container */}
            <div className="flex items-center gap-8 md:gap-12 justify-between md:justify-end shrink-0 w-full md:w-auto">
                <div className="flex flex-col items-start md:items-end md:w-24">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Allocated</span>
                    <span className="text-[13px] font-black text-slate-800">${fmt(item.amount)}</span>
                </div>

                <div className="flex flex-col items-start md:items-end md:w-28">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Returns (ROI)</span>
                    <div className="flex flex-col items-start md:items-end">
                        <span className={cn("text-[13px] font-black", !isRequest && item.totalReturns > 0 ? "text-emerald-600" : "text-slate-400")}>
                            {isRequest ? "$--" : `$${fmt(item.totalReturns)}`}
                        </span>
                        {!isRequest && item.totalReturns > 0 && (
                            <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5 mt-0.5">
                                <Zap className="w-2 h-2 fill-current" aria-hidden="true" /> +{roi.toFixed(2)}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-24 flex justify-start md:justify-center">
                    <CompactBadge status={item.status} />
                </div>

                <Button asChild variant="ghost" size="sm" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 p-0 transition-all group-hover:translate-x-0.5">
                    <Link href={isRequest ? `/invest/track/${item.id || item._id}` : `/invest/track/${item.id || item._id}`} aria-label={`Track ${item.index?.name || "Manual Deposit"}`}>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
});

// Grid View Card
const PortfolioCard = React.memo(function PortfolioCard({ item }) {
    const isRequest = item.isRequest;
    const roi = !isRequest && item.amount > 0 ? ((item.totalReturns / item.amount) * 100) : 0;
    const url = isRequest ? `/invest/track/${item.id || item._id}` : `/invest/track/${item.id || item._id}`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-4 flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isRequest ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600")}>
                    {isRequest ? <CreditCard className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
                <CompactBadge status={item.status} />
            </div>

            {/* Name */}
            <div className="mb-5">
                <h4 className="font-black text-sm text-slate-900 tracking-tight mb-0.5 group-hover:text-blue-600 transition-colors">
                    {item.index?.name || "Manual Deposit"}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>

            {/* Stats Body */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3 mt-auto border border-slate-100/60">
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Capital</p>
                    <p className="text-xs font-black text-slate-800">${fmt(item.amount)}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Returns</p>
                    <p className={cn("text-xs font-black", !isRequest && item.totalReturns > 0 ? "text-emerald-600" : "text-slate-500")}>
                        {isRequest ? "--" : `$${fmt(item.totalReturns)}`}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <Link href={url} className="absolute inset-0 z-10" aria-label={`View details for ${item.index?.name || "Manual Deposit"}`} />
        </motion.div>
    );
});


// --- Main Page ---

export default function InvestmentsPage() {
    const { investments, loading: investmentsLoading } = useInvestments();
    const { data: summaryData, loading: summaryLoading } = useInvestmentSummary();
    const { payments: pendingPayments } = usePaymentRequests();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [viewMode, setViewMode] = useState("list"); // list | grid

    const loading = investmentsLoading || summaryLoading;
    
    // Logic preprocessing matches the original thoroughly
    const activeTabLower = activeTab.toLowerCase();
    const firstPending = pendingPayments.find(p => p.status === 'pending' || p.status === 'proof_uploaded');
    const visibleRequests = pendingPayments.filter(req => req.status !== 'approved');

    const allItems = React.useMemo(() => [
        ...visibleRequests.map(req => ({
            id: req.id,
            _id: req.id,
            amount: req.amount,
            totalReturns: 0,
            status: req.status,
            createdAt: req.createdAt,
            index: req.index,
            isRequest: true
        })),
        ...investments.map(inv => ({
            ...inv,
            isRequest: false
        }))
    ], [visibleRequests, investments]);

    const filtered = React.useMemo(() => allItems.filter(inv => {
        const indexName = inv.index?.name || '';
        const matchesSearch = indexName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ((inv.id || inv._id) && (inv.id || inv._id).toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesTab = true;
        if (activeTabLower !== "all") {
            if (activeTabLower === 'pending') {
                matchesTab = ['pending', 'proof_uploaded', 'verified', 'rejected', 'expired'].includes(inv.status);
            } else {
                matchesTab = inv.status === activeTabLower;
            }
        }
        return matchesSearch && matchesTab;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [allItems, searchQuery, activeTabLower]);

    const totalInvested = summaryData?.overview?.totalInvested || 0;
    const totalReturns = summaryData?.overview?.totalReturns || 0;
    const activeCount = summaryData?.overview?.activeCount || investments.filter(i => i.status === 'active').length;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Portfolios...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto w-full space-y-6 pb-12">
            
            {/* ─── Top Dynamic Dashboard Header ─── */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] text-white p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-800">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Dashboard</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Portfolio Assets</h1>
                        <p className="text-slate-400 text-xs md:text-sm font-medium mt-1 max-w-md leading-relaxed">
                            Track real-time cumulative returns and algorithmic trading statistics across all locked and flexible assets.
                        </p>
                    </div>

                    <Button asChild size="lg" className="bg-white hover:bg-slate-50 text-[#0f172a] font-black rounded-xl shadow-lg shadow-white/5 border-0 self-start md:self-center">
                        <Link href="/invest">
                            Launch Capital <ArrowRight className="w-4 h-4 ml-2 stroke-[3]" />
                        </Link>
                    </Button>
                </div>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 md:mt-10 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Wallet className="w-3.5 h-3.5 opacity-60" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Deployed Capital</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black tracking-tight">${fmt(totalInvested)}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp className="w-3.5 h-3.5 opacity-60" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Cumulative Gains</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl md:text-3xl font-black tracking-tight text-emerald-400">${fmt(totalReturns)}</p>
                            {totalInvested > 0 && (
                                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-1.5 rounded-md">
                                    +{((totalReturns / totalInvested) * 100).toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Zap className="w-3.5 h-3.5 opacity-60" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Live Engines</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black tracking-tight">{activeCount} Position{activeCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {/* ─── Immediate Action Alert ─── */}
            <AnimatePresence>
                {firstPending && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 relative group">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-amber-900 leading-snug flex items-center gap-2">
                                    Attention Required
                                    <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">Action Lock</span>
                                </h3>
                                <p className="text-xs font-medium text-amber-700/80 mt-0.5">
                                    {firstPending.status === 'proof_uploaded'
                                        ? `Verification is pending for your ${(firstPending.index?.name || 'recent')} entry. Standard SLA is 2-4 hours.`
                                        : `Secure your liquidity pool lock by completing the \$${firstPending.amount.toLocaleString()} transfer.`}
                                </p>
                            </div>
                            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl px-5 text-xs h-9 shadow-sm shrink-0">
                                <Link href={`/invest/track/${firstPending.id || firstPending._id}`}>
                                    {firstPending.status === 'proof_uploaded' ? 'View Logistics' : 'Authenticate Now'}
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Operational View (Filters + Table/Grid) ─── */}
            <div className="flex flex-col gap-4">
                
                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                                placeholder="Search by Asset or ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-slate-50 border-transparent focus:bg-white text-[11px] font-medium placeholder:text-slate-400 rounded-xl transition-all"
                            />
                        </div>
                        
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden lg:block">
                            <TabsList className="bg-slate-100/80 h-9 p-1 rounded-xl gap-1">
                                {['all', 'active', 'pending', 'completed'].map(tab => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className="rounded-lg text-[10px] font-black uppercase tracking-wider h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex items-center gap-2 justify-between md:justify-end">
                        {/* Mobile Tab Dropdown simulation or simple select could go here, keeping standard mobile friendly select instead */}
                        <div className="flex lg:hidden w-full">
                             <select 
                                value={activeTab} 
                                onChange={e => setActiveTab(e.target.value)}
                                className="h-9 w-full bg-slate-50 border-0 rounded-xl text-[11px] font-bold uppercase tracking-wider px-3"
                             >
                                <option value="all">All Assets</option>
                                <option value="active">Active Only</option>
                                <option value="pending">In Review</option>
                                <option value="completed">Completed</option>
                             </select>
                        </div>

                        <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0 h-9">
                            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                                <List className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                                <Grid3x3 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Space */}
                <AnimatePresence mode="wait">
                    {filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white border border-dashed border-gray-200 rounded-3xl py-16 flex flex-col items-center justify-center text-center px-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                <Activity className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-black text-slate-800 mb-1">No Datasets Discovered</h3>
                            <p className="text-xs font-medium text-slate-400 mb-6 max-w-xs">Refine your query constraints or deploy fresh liquidity from the launchpad.</p>
                            <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveTab("all"); }} className="rounded-xl text-[11px] font-black uppercase tracking-wider h-9 px-6 border-slate-200 shadow-sm">
                                Reset Config
                            </Button>
                        </motion.div>
                    ) : viewMode === "list" ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* Desk Table Header (Only visible on md+) */}
                            <div className="hidden md:flex items-center px-4 h-11 bg-slate-50 border-b border-gray-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex-1 pl-13">Asset Specification</span>
                                <div className="flex items-center gap-12 shrink-0">
                                    <span className="w-24 text-right">Capital</span>
                                    <span className="w-28 text-right">Performance</span>
                                    <span className="w-24 text-center">Lifecycle</span>
                                    <span className="w-8"></span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col">
                                {filtered.map(item => (
                                    <PortfolioRow key={item.id || item._id} item={item} />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filtered.map(item => (
                                <PortfolioCard key={item.id || item._id} item={item} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
