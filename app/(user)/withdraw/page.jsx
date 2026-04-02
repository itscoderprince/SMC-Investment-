"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Wallet,
    AlertCircle,
    CheckCircle,
    Clock,
    X,
    Info,
    ChevronRight,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    History,
    CreditCard,
    ArrowLeft,
    Plus,
    Home,
    Loader2,
    ShieldCheck,
    Copy,
    AlertTriangle
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
import { Label } from "@/components/ui/label";
import { useWithdrawals, useAvailableBalance } from "@/hooks/useApi";
import { withdrawalsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const minWithdrawal = 20;

export default function WithdrawPage() {
    const { user, refreshUser } = useAuthStore();
    const { balance, totalWithdrawn, loading: balanceLoading, refetch: refetchBalance } = useAvailableBalance();
    const { withdrawals, loading: withdrawalsLoading, refetch: refetchWithdrawals } = useWithdrawals();

    const [amount, setAmount] = useState("");
    const [cryptoDetails, setCryptoDetails] = useState({
        address: "",
        network: "BEP20"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [requestId, setRequestId] = useState("");
    const [error, setError] = useState(null);

    const kycStatus = user?.kycStatus;
    const availableBalance = balance || 0;
    const savedCryptoDetails = user?.cryptoDetails || null;

    useEffect(() => {
        if (savedCryptoDetails) {
            setCryptoDetails({
                address: savedCryptoDetails.address || "",
                network: savedCryptoDetails.network || "BEP20"
            });
        }
    }, [savedCryptoDetails]);

    const parsedAmount = parseInt(amount.replace(/,/g, "")) || 0;
    const isValidAmount = parsedAmount >= minWithdrawal && parsedAmount <= availableBalance;
    const hasCryptoDetails = cryptoDetails.address.length >= 10 && cryptoDetails.network;
    const canSubmit = isValidAmount && hasCryptoDetails && !isSubmitting && kycStatus === 'approved';

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value) {
            setAmount(parseInt(value).toLocaleString());
        } else {
            setAmount("");
        }
    };

    const handleWithdrawAll = () => {
        setAmount(availableBalance.toLocaleString());
    };

    const handleCryptoChange = (field, value) => {
        setCryptoDetails((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const requestData = {
                amount: parsedAmount,
                method: 'crypto',
                cryptoDetails: cryptoDetails
            };

            const result = await withdrawalsApi.createRequest(requestData);
            setRequestId(result.requestId || result.id || `WD-${Date.now().toString().slice(-8)}`);
            setShowSuccess(true);
            refetchBalance();
            refetchWithdrawals();
            await refreshUser();
        } catch (err) {
            setError(err.message || 'Failed to create withdrawal request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (balanceLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Accessing Wallet Network...</p>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="max-w-md mx-auto py-10 px-4">
                <Card className="border-none shadow-2xl text-center p-8 overflow-hidden rounded-[2rem]">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Request Processed</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Payout sequence initiated</p>

                    <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3 border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Amount</span>
                            <span className="font-black text-slate-900">${amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Protocol</span>
                            <span className="font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded text-[9px]">{cryptoDetails.network} (USDT)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">ID</span>
                            <span className="font-mono text-slate-600 text-[10px]">#{requestId}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button asChild className="w-full bg-slate-900 hover:bg-black text-white font-black h-12 rounded-xl text-[10px] tracking-widest uppercase">
                            <Link href="/withdraw">View Terminal</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full h-10 font-bold text-slate-400 hover:text-slate-900 text-[10px]">
                            <Link href="/dashboard">Return Home</Link>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const recentWithdrawals = withdrawals.slice(0, 5);

    return (
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-4 space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard" className="text-[9px] font-black uppercase tracking-widest text-slate-400">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="scale-75" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Withdraw Funds</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Wallet Withdrawal</h1>
                </div>

                {kycStatus !== 'approved' && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 px-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest leading-none">KYC Required</p>
                        </div>
                        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[9px] h-6 px-3 rounded-md uppercase tracking-widest shrink-0">
                            <Link href="/kyc">Verify</Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Compact Balance Card */}
                    <Card className="border-none bg-slate-900 text-white overflow-hidden rounded-[2rem] shadow-xl shadow-blue-500/5">
                        <CardContent className="p-6 md:p-8 relative">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Wallet className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Available Profits</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">${availableBalance.toLocaleString()}</h2>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Instant</span>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Syced with Block Index</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 px-4 backdrop-blur-sm min-w-[120px]">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Payouts</p>
                                    <p className="text-lg font-black text-white">${(totalWithdrawn || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            {/* Simple light effect */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        </CardContent>
                    </Card>

                    {/* Withdrawal Form */}
                    <Card className="border-none bg-white shadow-sm border border-slate-100 rounded-[2rem] overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                </div>
                                <CardTitle className="text-base font-black text-slate-900 tracking-tight">Configuration</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Amount <span className="text-red-500">*</span></Label>
                                        <button onClick={handleWithdrawAll} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline px-1">Max</button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">$</div>
                                        <Input
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="0"
                                            className="h-12 pl-10 text-xl font-black border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500/20 rounded-xl transition-all"
                                        />
                                        {amount && !isValidAmount && (
                                            <div className="absolute -bottom-5 left-1 text-[8px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-widest">
                                                <AlertCircle className="w-2.5 h-2.5" />
                                                {parsedAmount < minWithdrawal ? `Min $${minWithdrawal}` : "Insufficient funds"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 ml-1">
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Profits: ${(balance - (user?.referralBonusEarned || 0)).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Referral: ${(user?.referralBonusEarned || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Network Protocol <span className="text-red-500">*</span></Label>
                                    <div className="grid grid-cols-2 h-12 bg-slate-50 p-1 rounded-xl border-2 border-slate-100">
                                        {['BEP20', 'TRC20'].map((net) => (
                                            <button
                                                key={net}
                                                onClick={() => handleCryptoChange("network", net)}
                                                className={cn(
                                                    "rounded-lg font-black text-[9px] uppercase tracking-widest transition-all",
                                                    cryptoDetails.network === net
                                                        ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                                                        : "text-slate-400 hover:text-slate-500"
                                                )}
                                            >
                                                {net}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">USDT Wallet Address <span className="text-red-500">*</span></Label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        placeholder="0x..."
                                        value={cryptoDetails.address}
                                        onChange={(e) => handleCryptoChange("address", e.target.value)}
                                        className="h-12 pl-12 font-mono text-xs border-2 border-slate-100 bg-slate-50/50 focus:bg-white rounded-xl"
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <p className="text-[8px] font-bold text-amber-800/70 uppercase tracking-wide leading-tight">
                                        Verify <span className="font-black underline">{cryptoDetails.network}</span> target. Incorrect protocols are irreversible.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.99] transition-all"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-[9px] uppercase tracking-widest">Processing...</span>
                                    </span>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-[9px] uppercase tracking-widest font-black">Confirm Withdrawal</span>
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Activity */}
                    <Card className="border-none bg-white shadow-sm border border-slate-100 rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-5 pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <History className="w-3.5 h-3.5 text-blue-600" />
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-900">Recent Logs</CardTitle>
                                </div>
                                <Button variant="ghost" className="h-6 text-[8px] font-black uppercase text-slate-400 p-0">All</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                            {withdrawalsLoading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-100 mx-auto" />
                                </div>
                            ) : recentWithdrawals.length === 0 ? (
                                <div className="py-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No history</div>
                            ) : (
                                <div className="space-y-1">
                                    {recentWithdrawals.map((item) => (
                                        <div key={item.id} className="p-3 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center border",
                                                    item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-red-50 text-red-600 border-red-100'
                                                )}>
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 leading-none">${(item.amount || 0).toLocaleString()}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "font-black text-[7px] uppercase tracking-widest h-4 px-1.5 border-none",
                                                item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                            )}>
                                                {item.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Security Compliance Block */}
                    <div className="bg-blue-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest">Protocol Guard</h3>
                            </div>
                            <p className="text-[9px] font-bold text-white/70 leading-relaxed uppercase tracking-widest">
                                3-layer verification enabled. Transactions end-to-end encrypted.
                            </p>
                        </div>
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
