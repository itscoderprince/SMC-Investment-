"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
    Users,
    Gift,
    TrendingUp,
    LayoutDashboard,
    Home,
    Search,
    ChevronRight,
    Loader2,
    DollarSign,
    Filter,
    ArrowUpRight,
    Activity,
    Shield,
    Calendar,
    ArrowRight,
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
import { Input } from "@/components/ui/input";
import { useAdminReferrals } from "@/hooks/useApi";

export default function AdminReferralsPage() {
    const { data: adminReferralData, loading, error } = useAdminReferrals();
    const [searchQuery, setSearchQuery] = useState("");

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const stats = adminReferralData?.stats || { totalReferrals: 0, totalBonusCredited: 0, activeReferrersCount: 0 };
    const referrals = adminReferralData?.referrals || [];

    const filteredReferrals = referrals.filter(ref => {
        const query = searchQuery.toLowerCase();
        return (
            ref.referrerId?.name?.toLowerCase().includes(query) ||
            ref.referrerId?.email?.toLowerCase().includes(query) ||
            ref.referredUserId?.name?.toLowerCase().includes(query) ||
            ref.referredUserId?.email?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/dashboard" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
                                <Shield className="w-3.5 h-3.5" />
                                Admin
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                <Users className="w-3.5 h-3.5" />
                                Referral Management
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">TOTAL</Badge>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total System Referrals</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalReferrals}</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <Badge className="bg-green-50 text-green-600 border-none font-black text-[10px]">PAYOUT</Badge>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bonuses Distributed</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">${stats.totalBonusCredited.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <Badge className="bg-purple-50 text-purple-600 border-none font-black text-[10px]">ACTIVE</Badge>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Referrers</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.activeReferrersCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Referral Table */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight">System Global Referrals</h2>
                        <p className="text-[11px] text-gray-500 font-medium">Monitoring and auditing all referral activities</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search referrer or user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 w-[280px] text-xs font-medium border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <Button variant="outline" className="h-9 rounded-xl border-gray-200 flex items-center gap-2 text-xs font-bold text-gray-600">
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                                <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 h-10">Referrer (Source)</TableHead>
                                <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10 text-center">Connection</TableHead>
                                <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10">Referred User (New)</TableHead>
                                <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10">Bonus Status</TableHead>
                                <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10">Amount</TableHead>
                                <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest h-10">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white">
                            {filteredReferrals.map((ref) => (
                                <TableRow key={ref._id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-100 last:border-0 h-16">
                                    <TableCell className="px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase shadow-sm">
                                                {ref.referrerId?.name?.charAt(0) || "A"}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 leading-none">{ref.referrerId?.name || "Deleted User"}</p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1">{ref.referrerId?.email || "N/A"}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <ArrowRight className="w-4 h-4 text-gray-300 mx-auto" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black uppercase border border-blue-100">
                                                {ref.referredUserId?.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 leading-none">{ref.referredUserId?.name || "Deleted User"}</p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1">{ref.referredUserId?.email || "N/A"}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${ref.status === 'bonus_credited' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-500/10' : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-500/10'}`}>
                                            {ref.status === 'bonus_credited' ? 'Credited' : 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-xs font-black text-gray-900">${(ref.bonusAmount || 0).toLocaleString()}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Bonus Distributed</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            {new Date(ref.createdAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
