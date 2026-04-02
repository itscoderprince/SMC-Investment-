"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Home,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useInvestments, useInvestmentSummary, usePaymentRequests } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const statusStyles = {
    active: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    proof_uploaded: "bg-blue-100 text-blue-700 border-blue-200",
    verified: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    closed: "bg-gray-100 text-gray-500 border-gray-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function InvestmentsPage() {
    const { investments, loading: investmentsLoading } = useInvestments();
    const { data: summaryData, loading: summaryLoading } = useInvestmentSummary();
    const { payments: pendingPayments } = usePaymentRequests();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const loading = investmentsLoading || summaryLoading;
    // Find first actionable request
    const firstPending = pendingPayments.find(p => p.status === 'pending' || p.status === 'proof_uploaded');

    // Filter out approved requests as they are already shown as investments
    // Also include 'verified' just in case
    const visibleRequests = pendingPayments.filter(req => req.status !== 'approved');

    // Combine investments and pending requests for the list
    const allItems = [
        ...visibleRequests.map(req => ({
            id: req.id,
            _id: req.id,
            amount: req.amount,
            totalReturns: 0,
            status: req.status, // keep original status
            createdAt: req.createdAt,
            index: req.index,
            isRequest: true
        })),
        ...investments.map(inv => ({
            ...inv,
            isRequest: false
        }))
    ];

    const filteredInvestments = allItems.filter(inv => {
        const indexName = inv.index?.name || '';
        const matchesSearch = indexName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ((inv.id || inv._id) && (inv.id || inv._id).toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesTab = true;
        if (activeTab !== "all") {
            if (activeTab === 'pending') {
                matchesTab = ['pending', 'proof_uploaded', 'verified', 'rejected', 'expired'].includes(inv.status);
            } else {
                matchesTab = inv.status === activeTab;
            }
        }

        return matchesSearch && matchesTab;
    });

    const totalInvested = summaryData?.overview?.totalInvested || 0;
    const totalReturns = summaryData?.overview?.totalReturns || 0;
    const activeCount = summaryData?.overview?.activeCount || investments.filter(i => i.status === 'active').length;

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pt-0 pb-2 md:pb-4 px-2 md:px-1">
            {/* Compact Breadcrumb Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Breadcrumb className="px-1">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
                                <Home className="w-3.5 h-3.5" />
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                <TrendingUp className="w-3.5 h-3.5" />
                                My Investments
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 font-bold text-[11px] uppercase tracking-wider shadow-md shadow-blue-500/20 h-7 px-3">
                        <Link href="/invest" className="flex items-center">
                            <ArrowRight className="w-3 h-3 mr-1.5" />
                            Invest More
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Pending Investment Card - Show only if there are pending requests */}
            {firstPending && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-500/20 rounded-3xl p-4 md:p-5 relative overflow-hidden group shadow-lg shadow-amber-500/5"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <Badge className="bg-amber-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-1.5 h-4">Action Required</Badge>
                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10">
                                        {firstPending.status === 'proof_uploaded' ? 'Verification Pending' : 'Payment Pending'}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                    {firstPending.index?.name || 'Investment'} • ${(firstPending.amount || 0).toLocaleString()}
                                </h3>
                                <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-widest mt-1 opacity-80">
                                    {firstPending.status === 'proof_uploaded'
                                        ? 'Your proof is under review. This usually takes a few hours.'
                                        : 'Complete payment to activate investment'}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-black rounded-lg h-8 px-5 uppercase tracking-widest text-[9px] shadow-md shadow-amber-500/20" asChild>
                                <Link href={`/invest/track/${firstPending.id || firstPending._id}`}>
                                    {firstPending.status === 'proof_uploaded' ? 'View Status' : 'Upload Proof'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white overflow-hidden group">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Invested</p>
                                <h3 className="text-lg font-black text-gray-900 leading-none">${totalInvested.toLocaleString()}</h3>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="h-1 w-full bg-blue-600" />
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Accumulated Returns</p>
                                <h3 className="text-lg font-black text-green-600 leading-none">${totalReturns.toLocaleString()}</h3>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 transition-transform group-hover:scale-110">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="h-1 w-full bg-green-600" />
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Portfolios</p>
                                <h3 className="text-lg font-black text-gray-900 leading-none">{activeCount}</h3>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="h-1 w-full bg-purple-600" />
                </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-fit">
                            <TabsList className="bg-gray-100/80 p-1 rounded-lg h-9">
                                <TabsTrigger value="all" className="rounded-[6px] font-bold px-4 h-7 text-[11px]">All</TabsTrigger>
                                <TabsTrigger value="active" className="rounded-[6px] font-bold px-4 h-7 text-[11px]">Active</TabsTrigger>
                                <TabsTrigger value="pending" className="rounded-[6px] font-bold px-4 h-7 text-[11px]">Pending</TabsTrigger>
                                <TabsTrigger value="completed" className="rounded-[6px] font-bold px-4 h-7 text-[11px]">Completed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {searchQuery && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                {filteredInvestments.length} results
                            </span>
                        )}
                    </div>

                    <div className="relative w-full md:w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 border-gray-200 rounded-lg text-xs bg-white focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                </div>

                <Card className="border-none shadow-sm overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-gray-400 py-3 h-10 px-6">Index Name</TableHead>
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-gray-400 py-3 h-10">Amount</TableHead>
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-gray-400 py-3 h-10">Returns</TableHead>
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-gray-400 py-3 h-10 text-center">Status</TableHead>
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-gray-400 py-3 h-10">Date</TableHead>
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-gray-400 py-3 h-10 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvestments.length > 0 ? (
                                filteredInvestments.map((inv) => (
                                    <TableRow key={inv.id || inv._id} className="group hover:bg-gray-50/50 transition-colors border-gray-100">
                                        <TableCell className="py-2.5 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{inv.index?.name || 'Unknown Index'}</span>
                                                <span className="text-[9px] font-bold text-gray-400">
                                                    {inv.isRequest ? 'REQ-' : 'INV-'}{(inv.id || inv._id)?.slice(-6)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <span className="font-bold text-gray-900 text-sm">${(inv.amount || 0).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <div className="flex flex-col">
                                                <span className={cn("font-bold text-sm", inv.totalReturns > 0 ? "text-green-600" : "text-gray-500")}>
                                                    {inv.isRequest ? '-' : `$${(inv.totalReturns || 0).toLocaleString()}`}
                                                </span>
                                                {!inv.isRequest && inv.totalReturns > 0 && (
                                                    <span className="text-[10px] font-bold text-green-500 bg-green-50 w-fit px-1.5 rounded mt-1">
                                                        +{((inv.totalReturns / inv.amount) * 100).toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2.5 text-center">
                                            <Badge variant="outline" className={`${statusStyles[inv.status] || statusStyles.pending} font-bold text-[9px] uppercase tracking-tighter px-1.5 h-4.5 rounded-[4px] border-gray-100`}>
                                                {inv.status === 'proof_uploaded' ? 'Verification' : inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2.5 text-right pr-6">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-blue-50 hover:text-blue-600" asChild>
                                                <Link href={inv.isRequest ? `/invest/track/${inv.id || inv._id}` : `/investments/${inv.id || inv._id}`}>
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Filter className="w-6 h-6 text-gray-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-900">No investments found</p>
                                                <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveTab("all"); }} className="font-bold">Clear Filters</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
