"use client";

import * as React from "react";
import { useState } from "react";
import {
    Users,
    Gift,
    Copy,
    CheckCircle2,
    Share2,
    DollarSign,
    UserPlus,
    Activity,
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
import { toast } from "react-hot-toast";
import { useReferrals } from "@/hooks/useApi";

export default function ReferralsPage() {
    const { data: referralData, loading } = useReferrals();
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
                <Activity className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const stats = referralData?.stats || { totalReferrals: 0, totalBonusEarned: 0, pendingReferrals: 0, completedReferrals: 0 };
    const referrals = referralData?.referrals || [];
    const referralCode = referralData?.referralCode;
    const displayCode = referralCode || "GENERATING...";

    return (
        <div className="space-y-6 w-full pt-2 pb-6 px-0 md:px-2">
            


            {/* Referral Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2 bg-primary text-primary-foreground border-none shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Gift className="w-64 h-64 -mr-16 -mt-16" />
                    </div>
                    <CardContent className="p-6 md:p-8 relative z-10">
                        <div className="max-w-md">
                            <Badge className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-none mb-4 px-3 py-1 font-bold text-[10px] tracking-widest uppercase shadow-none">
                                Exclusive Bonus
                            </Badge>
                            <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight">
                                Earn 5% Daily From <br /> Your Network
                            </h2>
                            <p className="text-primary-foreground/80 mb-8 text-xs md:text-sm font-medium leading-relaxed max-w-sm">
                                Invite your friends to join the platform. Receive an instant 5% bonus of their initial investment directly to your balance.
                            </p>

                            <div className="bg-background/10 backdrop-blur-md rounded-2xl p-4 border border-background/20">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-primary-foreground/70 mb-2">Your Referral Link</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-background/10 px-4 py-2.5 rounded-xl font-mono text-xs overflow-hidden truncate border border-background/10 select-all cursor-text text-primary-foreground">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${displayCode}` : `.../register?ref=${displayCode}`}
                                    </div>
                                    <Button
                                        onClick={handleCopyLink}
                                        disabled={!referralCode}
                                        className="bg-background text-primary hover:bg-background/90 h-10 px-6 font-bold text-xs rounded-xl transition-all active:scale-95 shrink-0 shadow-sm"
                                    >
                                        {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copied ? "COPIED" : "COPY LINK"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-none shadow-sm bg-background">
                    <CardHeader className="pb-4 pt-6 md:pt-8">
                        <CardTitle className="text-sm font-black text-foreground uppercase tracking-tight">Referral Stats</CardTitle>
                        <CardDescription className="text-[10px] font-medium">Your performance at a glance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Referrals</p>
                                    <p className="text-xl font-black text-foreground tracking-tight">{stats.totalReferrals}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[9px] uppercase shadow-none">{stats.completedReferrals} Active</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bonus Earned</p>
                                    <p className="text-xl font-black text-foreground tracking-tight">${(referralData?.referralBonusEarned || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Referral Code</span>
                                    <span className="font-mono font-black text-primary text-sm tracking-wider mt-0.5">{displayCode}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
                                    onClick={handleCopyCode}
                                    disabled={!referralCode}
                                >
                                    {codeCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <Button
                                onClick={handleWhatsAppShare}
                                disabled={!referralCode}
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs h-10 rounded-xl shadow-md shadow-[#25D366]/20 transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share on WhatsApp
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* How it Works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {[
                    { title: "Invite Friends", desc: "Share your code or link with your network.", icon: UserPlus, color: "text-blue-600", bg: "bg-blue-500/10" },
                    { title: "Friends Join", desc: "They register and start their investment journey.", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
                    { title: "Earn 5% Bonus", desc: "Get instant bonus on every capital deposit.", icon: Gift, color: "text-amber-500", bg: "bg-amber-500/10" }
                ].map((step, i) => (
                    <Card key={i} className="border-none shadow-sm bg-background overflow-hidden relative">
                        <CardContent className="p-4 md:p-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.bg} ${step.color}`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <h4 className="text-xs font-black text-foreground uppercase tracking-tight">{step.title}</h4>
                                <p className="text-[10px] text-muted-foreground font-medium leading-tight">{step.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Referral History */}
            <Card className="border-none shadow-sm overflow-hidden bg-background">
                <CardHeader className="pb-4 pt-6 border-b border-border/50 bg-muted/10">
                    <CardTitle className="text-sm font-black text-foreground tracking-tight uppercase">Referral Activity</CardTitle>
                    <CardDescription className="text-[10px] font-medium">Tracking your network's growth and bonuses</CardDescription>
                </CardHeader>
                
                <div className="overflow-x-auto">
                    {referrals.length === 0 ? (
                        <div className="p-12 md:p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">No Connections Yet</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1 max-w-xs mx-auto">Start sharing your referral link with your network to earn rewards.</p>
                            <Button onClick={handleCopyLink} size="sm" className="mt-6 font-bold text-xs px-6 h-9 rounded-lg shadow-sm">
                                Start Inviting
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-background hover:bg-background border-border">
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-6 h-11">User</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-11">Join Date</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-11">Capital</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-11">Commission</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-11 text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referrals.map((ref) => (
                                    <TableRow key={ref.id} className="hover:bg-muted/30 transition-colors border-border h-16">
                                        <TableCell className="px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                                                    {ref.user?.name?.charAt(0) || "U"}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-xs font-bold text-foreground tracking-tight">{ref.user?.name || "Unknown"}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{ref.user?.email || "N/A"}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-muted-foreground">
                                            {new Date(ref.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-xs font-black text-foreground">
                                            {ref.amount ? `$${ref.amount.toLocaleString()}` : "—"}
                                        </TableCell>
                                        <TableCell className="text-xs font-black text-emerald-600">
                                            {ref.bonus ? `+$${ref.bonus.toLocaleString()}` : "—"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-none border ${ref.status === 'bonus_credited' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
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
    );
}
