"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Wallet,
    AlertCircle,
    CheckCircle,
    Clock,
    ChevronRight,
    ArrowUpRight,
    History,
    CreditCard,
    Loader2,
    ShieldCheck,
    AlertTriangle,
    Activity,
    Zap,
    Lock,
    DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWithdrawals, useAvailableBalance } from "@/hooks/useApi";
import { withdrawalsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

const minWithdrawal = 20;

export default function WithdrawPage() {
    // 1. GLOBAL AUTHENTICATION STATE
    const { user, refreshUser } = useAuthStore();
    
    // 2. DATA FETCHING (POWERED BY REACT QUERY)
    // useAvailableBalance and useWithdrawals now internally use useQuery.
    // They will automatically cache responses and handle loading states seamlessly.
    const { balance, totalWithdrawn, loading: balanceLoading, refetch: refetchBalance } = useAvailableBalance();
    const { withdrawals, loading: withdrawalsLoading, refetch: refetchWithdrawals } = useWithdrawals();

    // 3. COMPONENT LOCAL STATE
    // Manages form inputs, loading toggles, and UI modal visibilities.
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

    const handleAmountChange = React.useCallback((e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value) {
            setAmount(parseInt(value).toLocaleString());
        } else {
            setAmount("");
        }
    }, []);

    const handleWithdrawAll = React.useCallback(() => {
        setAmount(availableBalance.toLocaleString());
    }, [availableBalance]);

    const handleCryptoChange = React.useCallback((field, value) => {
        setCryptoDetails((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = React.useCallback(async () => {
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
            toast.success("Dispatch Sequence Initiated");
            refetchBalance();
            refetchWithdrawals();
            await refreshUser();
        } catch (err) {
            setError(err.message || 'Failed to dispatch transaction');
            toast.error("Dispatch routing failure.");
        } finally {
            setIsSubmitting(false);
        }
    }, [canSubmit, parsedAmount, cryptoDetails, refetchBalance, refetchWithdrawals, refreshUser]);

    if (balanceLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] animate-pulse">Synchronizing Vault Ledger...</p>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden"
                >
                    <div className="bg-[#0f172a] text-white p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Offload Secure</h2>
                                <p className="text-xs font-medium text-slate-400 mt-1">Liquidity packet is in transit.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-6 bg-white">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursed</span>
                                <span className="text-lg font-black text-slate-900">${amount}</span>
                            </div>
                            <div className="h-px bg-slate-200/50" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Rail</span>
                                <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{cryptoDetails.network} (USDT)</span>
                            </div>
                            <div className="h-px bg-slate-200/50" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trace Identifier</span>
                                <span className="font-mono text-xs font-bold text-slate-600">#{requestId.substring(0, 8).toUpperCase()}</span>
                            </div>
                        </div>

                        <Button asChild className="w-full h-12 bg-[#0f172a] hover:bg-slate-800 text-white font-black rounded-xl text-[11px] uppercase tracking-[0.2em] shadow-lg">
                            <Link href="/dashboard">Finalize & Close</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const recentWithdrawals = withdrawals.slice(0, 5);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            
            {/* ─── Dynamic Control Header ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capital Distribution</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Withdrawal Matrix</h1>
                </div>

                <AnimatePresence>
                    {kycStatus !== 'approved' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm"
                        >
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide">Verification Mandate Required</span>
                            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white h-7 rounded-lg font-black text-[9px] px-3 uppercase tracking-widest shadow-sm ml-1">
                                <Link href="/kyc">Audit Now</Link>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Main Matrix Split ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Wing: The Setup Form */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Master Vault Card */}
                    <div className="bg-[#0f172a] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl shadow-slate-200 border border-slate-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                    <Wallet className="w-4 h-4 opacity-60" />
                                    Extractable Liquidity
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">${availableBalance.toLocaleString()}</h2>
                                <div className="pt-2 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                                        <Zap className="w-2.5 h-2.5 text-amber-400 fill-current" /> Express Channel
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md md:min-w-[180px] flex flex-col justify-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Aggregated Offloads</p>
                                <p className="text-2xl font-black text-white tracking-tight">${(totalWithdrawn || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Center */}
                    <Card className="bg-white rounded-3xl border-slate-100 shadow-sm overflow-hidden relative group">
                        <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">Route Execution</CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Amount Control */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Allocation Scale <span className="text-red-500">*</span></Label>
                                        <button onClick={handleWithdrawAll} className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:text-blue-700 transition-colors">Sweep Max</button>
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <Input
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="0"
                                            className="h-14 pl-11 text-xl font-black border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl transition-all"
                                        />
                                        
                                        <AnimatePresence>
                                            {amount && !isValidAmount && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute -bottom-6 left-1 flex items-center gap-1 text-[9px] font-black text-red-600 uppercase tracking-widest"
                                                >
                                                    <AlertCircle className="w-3 h-3" />
                                                    {parsedAmount < minWithdrawal ? `Threshold Min \$${minWithdrawal}` : "Cap Limit Breach"}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Protocol Selector */}
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Network Standard <span className="text-red-500">*</span></Label>
                                    <div className="grid grid-cols-2 h-14 bg-slate-100/80 border border-slate-100 p-1.5 rounded-2xl">
                                        {['BEP20', 'TRC20'].map((net) => (
                                            <button
                                                key={net}
                                                onClick={() => handleCryptoChange("network", net)}
                                                className={cn(
                                                    "rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-200",
                                                    cryptoDetails.network === net
                                                        ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                                                        : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {net}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Target Wallet Address */}
                            <div className="space-y-3 pt-1">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">USDT Dest. Node Endpoint <span className="text-red-500">*</span></Label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        placeholder="Paste 0x or TRC Address"
                                        value={cryptoDetails.address}
                                        onChange={(e) => handleCryptoChange("address", e.target.value)}
                                        className="h-14 pl-12 font-mono text-sm bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl transition-all font-bold"
                                    />
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl mt-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-amber-800/90 uppercase tracking-wide leading-relaxed">
                                        Ensure destination explicitly handles <span className="font-black underline decoration-2">{cryptoDetails.network}</span> protocol streams. Crossed chain payloads are irrecoverable by SMC system ops.
                                    </p>
                                </div>
                            </div>

                            {/* Fire Launch */}
                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className="w-full h-14 bg-[#0f172a] hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-slate-200 text-[11px] uppercase tracking-[0.25em] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-[#0f172a]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Initiate Distribute Sequence <Zap className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Wing: Logging Sidepane */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Recent Audit Stream */}
                    <Card className="bg-white rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-900">Audit Logs</CardTitle>
                            </div>
                            {/* Empty spacer to mirror design */}
                        </CardHeader>
                        
                        <CardContent className="p-2">
                            {withdrawalsLoading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" />
                                </div>
                            ) : recentWithdrawals.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Clear</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {recentWithdrawals.map((item) => {
                                        const isApproved = item.status === 'approved';
                                        const isPending = item.status === 'pending';

                                        return (
                                            <div key={item.id} className="p-3.5 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                        isApproved ? 'bg-emerald-50 text-emerald-600' :
                                                        isPending ? 'bg-amber-50 text-amber-600' :
                                                        'bg-red-50 text-red-600'
                                                    )}>
                                                        {isApproved ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-tight">${(item.amount || 0).toLocaleString()}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                    isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                    isPending ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                    'bg-red-50 border-red-200 text-red-700'
                                                )}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Network Guardian Widget */}
                    <div className="bg-[#0f172a] rounded-3xl p-6 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-400 shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.15em] mb-1 text-white">Protocol Guardian</h3>
                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                                    Multisignature verification enabled. Outbound channels encrypted under SHA-256 standard entropy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
