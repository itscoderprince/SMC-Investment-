"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    Gift,
    Copy,
    CheckCircle2,
    Clock,
    TrendingUp,
    LayoutDashboard,
    Home,
    Search,
    ChevronRight,
    Loader2,
    Share2,
    DollarSign,
    UserPlus,
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
import { toast } from "sonner";
import { useReferrals } from "@/hooks/useApi";

export default function ReferralsPage() {
    const { data: referralData, loading, error, refetch } = useReferrals();
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCopyLink = () => {
        if (!referralData?.referralCode) return;
        const link = `${window.location.origin}/register?ref=${referralData.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyCode = () => {
        if (!referralData?.referralCode) return;
        navigator.clipboard.writeText(referralData.referralCode);
        setCodeCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleWhatsAppShare = () => {
        if (!referralData?.referralCode) return;
        const link = `${window.location.origin}/register?ref=${referralData.referralCode}`;
        const text = `Hey! Join SMC Protocol and start growing your wealth. Use my referral link to get started: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const stats = referralData?.stats || { totalReferrals: 0, totalBonusEarned: 0, pendingReferrals: 0, completedReferrals: 0 };
    const referrals = referralData?.referrals || [];
    const referralCode = referralData?.referralCode;
    const displayCode = referralCode || "GENERATING...";

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-2 md:px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Breadcrumb>
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
                                <Users className="w-3.5 h-3.5" />
                                Referrals
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Referral Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Gift className="w-64 h-64 -mr-16 -mt-16" />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="max-w-md">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 px-3 py-1 font-bold text-xs">
                                EXCLUSIVE BONUS
                            </Badge>
                            <h1 className="text-3xl font-black mb-4 leading-tight">
                                Earn 5% Daily From <br /> Your Network
                            </h1>
                            <p className="text-blue-100 mb-8 text-sm leading-relaxed">
                                Invite your friends to join SMC Protocol. Get 5% instant bonus of their investment amount directly to your wallet balance.
                            </p>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <p className="text-[10px] uppercase font-black tracking-widest text-blue-200 mb-2">Your Referral Link</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white/5 px-4 py-2.5 rounded-xl font-mono text-xs overflow-hidden truncate border border-white/10 select-all cursor-text">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${displayCode}` : `.../register?ref=${displayCode}`}
                                    </div>
                                    <Button
                                        onClick={handleCopyLink}
                                        disabled={!referralCode}
                                        className="bg-white text-blue-600 hover:bg-blue-50 h-10 px-6 font-black text-xs rounded-xl transition-all active:scale-95 shrink-0"
                                    >
                                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copied ? "COPIED" : "COPY LINK"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-none shadow-lg bg-white">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-black text-gray-900 uppercase tracking-tight text-center lg:text-left">Referral Stats</CardTitle>
                        <CardDescription className="text-[10px] text-center lg:text-left">Your performance at a glance</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Referrals</p>
                                    <p className="text-xl font-black text-gray-900">{stats.totalReferrals}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className="bg-green-50 text-green-700 border-none font-black text-[9px] uppercase">{stats.completedReferrals} Active</Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bonus Earned</p>
                                    <p className="text-xl font-black text-gray-900">${(referralData?.referralBonusEarned || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Referral Code</span>
                                    <span className="font-mono font-black text-blue-600 text-sm tracking-wider">{displayCode}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                    onClick={handleCopyCode}
                                    disabled={!referralCode}
                                >
                                    {codeCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <Button
                                onClick={handleWhatsAppShare}
                                disabled={!referralCode}
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl shadow-md shadow-green-500/10"
                            >
                                <Share2 className="w-3.5 h-3.5 mr-2" />
                                Share on WhatsApp
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* How it Works - In-Depth Part */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "Invite Friends", desc: "Share your code or link with your network.", icon: UserPlus, color: "blue" },
                    { title: "Friends Join", desc: "They register and start their investment journey.", icon: CheckCircle2, color: "green" },
                    { title: "Earn 5% Bonus", desc: "Get instant bonus on every capital deposit.", icon: Gift, color: "amber" }
                ].map((step, i) => (
                    <Card key={i} className="border-gray-100 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${step.color}-50 text-${step.color}-600 shrink-0`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{step.title}</h4>
                                <p className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">{step.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Referral History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight">Referral Activity</h2>
                        <p className="text-[11px] text-gray-500 font-medium tracking-tight">Tracking your network's growth and bonuses</p>
                    </div>
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {referrals.length === 0 ? (
                            <div className="p-16 text-center bg-white rounded-xl">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-sm font-black text-gray-900">No Connections Yet</h3>
                                <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">Start sharing your referral link with your network to earn rewards.</p>
                                <Button onClick={handleCopyLink} size="sm" className="mt-6 bg-blue-600 font-black text-xs px-8 h-9 rounded-xl shadow-lg shadow-blue-500/20">
                                    START INVITING
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 h-10 font-black">User</TableHead>
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10 font-black">Join Date</TableHead>
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10 font-black">Capital</TableHead>
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10 font-black">Commission</TableHead>
                                        <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10 font-black">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white">
                                    {referrals.map((ref) => (
                                        <TableRow key={ref.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-100 last:border-0 h-16">
                                            <TableCell className="px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black uppercase border border-blue-100">
                                                        {ref.user?.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 leading-none">{ref.user?.name || "Unknown"}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium mt-1">{ref.user?.email || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-gray-600">
                                                {new Date(ref.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="text-xs font-black text-gray-900">
                                                {ref.amount ? `$${ref.amount.toLocaleString()}` : "—"}
                                            </TableCell>
                                            <TableCell className="text-xs font-black text-green-600">
                                                {ref.bonus ? `+$${ref.bonus.toLocaleString()}` : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${ref.status === 'bonus_credited' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                    {ref.status === 'bonus_credited' ? 'Credited' : 'Awaiting Investment'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
