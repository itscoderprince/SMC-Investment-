"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Wallet,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Copy,
    Check,
    ArrowRight,
    Info,
    ArrowUpRight,
    Loader2,
    Lock,
    Upload,
    BadgeCheck,
    BarChart3,
    Activity,
    Target,
    Globe2,
    Cpu,
    ShieldCheck,
    Clock
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import { useIndices, useInvestmentSummary } from "@/hooks/useApi";
import { paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Suspense } from "react";

function InvestContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const indexIdFromUrl = searchParams.get("index");

    // 1. STATE & GLOBAL STORE
    // We fetch the authenticated user from Zustand store to check KYC verification status
    const { user } = useAuthStore();
    const kycStatus = user?.kycStatus;

    // 2. DATA FETCHING (REACT QUERY POWERED)
    // useIndices retrieves the available investment products from the API.
    // By destructuring { indices, loading, error }, we handle the asynchronous state cleanly.
    const { indices, loading: indicesLoading, error: indicesError } = useIndices();
    const { data: summaryData } = useInvestmentSummary();

    // 3. LOCAL UI STATE
    // These states control the interactive elements of the page (modals, forms, loading spinners)

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [amount, setAmount] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("bep20_usdt");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (indices && indexIdFromUrl) {
            const found = indices.find(idx => (idx.id || idx._id) === indexIdFromUrl);
            if (found) {
                setSelectedIndex(found);
                setDialogOpen(true);
            }
        }
    }, [indices, indexIdFromUrl]);

    const handleAmountChange = React.useCallback((e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value) {
            setAmount(parseInt(value).toLocaleString());
        } else {
            setAmount("");
        }
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!selectedIndex || !amount) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const parsedAmount = parseInt(amount.replace(/,/g, ""));
            const result = await paymentsApi.createRequest({
                indexId: selectedIndex.id || selectedIndex._id,
                amount: parsedAmount,
                paymentMethod: paymentMethod,
            });

            // Instead of complex inline steps, direct cleanly to tracking which handles it natively.
            toast.success("Registry Dispatch Confirmed");
            setDialogOpen(false);
            
            // Wait a beat and redirect to track
            setTimeout(() => {
                router.push(`/invest/track/${result.id || result._id}`);
            }, 300);
        } catch (err) {
            setError(err.message || 'Pipeline instantiation failed.');
            toast.error(err.message || "Launch failed.");
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedIndex, amount, paymentMethod, router]);

    const resetForm = React.useCallback(() => {
        setSelectedIndex(null);
        setAmount("");
        setAgreeTerms(false);
        setError(null);
        setDialogOpen(false);
        setPaymentMethod("bep20_usdt");
    }, []);

    if (indicesLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Loading Markets...</span>
            </div>
        );
    }

    if (indicesError) {
        return (
            <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center bg-white border rounded-3xl border-slate-100">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="font-black text-slate-900 tracking-tight mb-1">Connectivity Disrupt</h3>
                <p className="text-xs text-slate-500 max-w-xs">Unable to pull index valuations from standard Oracle.</p>
            </div>
        );
    }

    const walletBalance = summaryData?.walletBalance || 0;
    const currentMin = selectedIndex?.minInvestment || 0;
    const parsedAmount = parseInt(amount.replace(/,/g, "")) || 0;
    const isValidAmount = parsedAmount >= currentMin;

    // Define branding mapping for variety
    const cardConfig = React.useMemo(() => [
        { grad: "from-blue-600 to-indigo-600", lightGrad: "bg-blue-50/50", icon: Globe2, iconCol: "text-blue-600" },
        { grad: "from-emerald-600 to-teal-600", lightGrad: "bg-emerald-50/50", icon: TrendingUp, iconCol: "text-emerald-600" },
        { grad: "from-violet-600 to-fuchsia-600", lightGrad: "bg-violet-50/50", icon: Cpu, iconCol: "text-violet-600" },
        { grad: "from-amber-600 to-orange-600", lightGrad: "bg-amber-50/50", icon: Target, iconCol: "text-amber-600" },
    ], []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            
            {/* ─── Global Dashboard Header ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Floor</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Investment Terminal</h1>
                </div>
                
                <div className="bg-white border border-slate-100 shadow-sm px-4 py-2.5 rounded-2xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Allocatable Vault</p>
                        <p className="text-base font-black text-slate-800 tracking-tight leading-none">${walletBalance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* ─── Compliance Warning ─── */}
            <AnimatePresence>
                {kycStatus !== 'approved' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 shadow-sm">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Entity Unverified</p>
                                <p className="text-xs font-medium text-amber-700/80 mt-0.5">Complete standard KYC protocols to enable capital deployments and gateway routing.</p>
                            </div>
                        </div>
                        <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-5 h-9 font-bold text-xs shadow-sm shrink-0">
                            <Link href="/kyc">Initialize Audit</Link>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Primary Product Matrix ─── */}
            {indices.length === 0 ? (
                <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                    <p className="text-sm font-bold text-slate-400">No active instruments available at this synchronization block.</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Available Markets">
                    {indices.map((idx, i) => {
                        const cfg = cardConfig[i % cardConfig.length];
                        const IconEl = cfg.icon;

                        return (
                            <motion.div
                                key={idx.id || idx._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative"
                            >
                                <Card className="h-full bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden rounded-3xl">
                                    
                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Card Top: Category & Returns */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", cfg.lightGrad, cfg.iconCol)}>
                                                <IconEl className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-emerald-600 justify-end">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    <span className="text-xl font-black tracking-tight">{idx.currentReturnRate}%</span>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Est. Weekly Yield</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1.5">{idx.name}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                                                    {idx.riskLevel || 'Medium'} RISK
                                                </Badge>
                                                {idx.lockPeriod && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-black uppercase tracking-wider flex gap-1 items-center">
                                                        <Clock className="w-2.5 h-2.5" /> {idx.lockPeriod}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Spec Grid */}
                                        <div className="grid grid-cols-2 gap-4 mt-auto bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Minimum Cap</p>
                                                <p className="text-sm font-black text-slate-800">${(idx.minInvestment || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Security</p>
                                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                                                    Full Cover <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0">
                                        <Dialog 
                                            open={dialogOpen && (selectedIndex?.id === idx.id || selectedIndex?._id === idx._id)} 
                                            onOpenChange={(open) => {
                                                if (kycStatus !== 'approved') {
                                                    router.push("/kyc");
                                                    return;
                                                }
                                                setDialogOpen(open);
                                                if (!open) resetForm();
                                            }}
                                        >
                                            <DialogTrigger asChild>
                                                <Button 
                                                    onClick={() => {
                                                        if (kycStatus === 'approved') setSelectedIndex(idx);
                                                    }}
                                                    className={cn(
                                                        "w-full h-12 font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-slate-200 rounded-2xl group-hover:shadow-blue-500/10 transition-all",
                                                        kycStatus !== 'approved' ? "bg-slate-100 text-slate-400 hover:bg-slate-200" : "bg-[#0f172a] hover:bg-blue-600 text-white"
                                                    )}
                                                >
                                                    Launch Deployment <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                </Button>
                                            </DialogTrigger>
                                            
                                            <DialogContent className="p-0 overflow-hidden border-none rounded-3xl shadow-2xl bg-white max-w-md">
                                                <div className="flex flex-col">
                                                    <div className="bg-[#0f172a] text-white p-6 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                                                        <div className="relative z-10 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-400">
                                                                <Target className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <DialogTitle className="text-base font-black uppercase tracking-tight text-white">Setup Pipeline</DialogTitle>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{idx.name}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 space-y-6">
                                                        {error && (
                                                            <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl text-red-600 text-[10px] font-bold text-center">
                                                                {error}
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 pl-1">Deployment Scale <span className="text-red-500">*</span></Label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">$</span>
                                                                <Input
                                                                    value={amount}
                                                                    onChange={handleAmountChange}
                                                                    placeholder="0"
                                                                    className="h-14 pl-9 text-xl font-black border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all"
                                                                />
                                                                {!isValidAmount && amount && (
                                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                                                                        Min: ${idx.minInvestment?.toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Protocol Network <span className="text-red-500">*</span></Label>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {[
                                                                    { id: 'bep20_usdt', label: 'BSC Scan', type: 'BEP-20' },
                                                                    { id: 'trc20_usdt', label: 'Tron Grid', type: 'TRC-20' }
                                                                ].map(net => (
                                                                    <button
                                                                        key={net.id}
                                                                        onClick={() => setPaymentMethod(net.id)}
                                                                        className={cn(
                                                                            "relative p-4 rounded-2xl border-2 text-left transition-all duration-300",
                                                                            paymentMethod === net.id ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                                                                        )}
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px]", paymentMethod === net.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>
                                                                                USDT
                                                                            </div>
                                                                            {paymentMethod === net.id && <CheckCircle className="w-4 h-4 text-blue-600 fill-blue-50" />}
                                                                        </div>
                                                                        <p className={cn("text-[10px] font-black uppercase tracking-wide", paymentMethod === net.id ? "text-blue-700" : "text-slate-700")}>{net.label}</p>
                                                                        <p className="text-[9px] font-bold text-slate-400">{net.type}</p>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-3">
                                                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                                            <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                                                Confirmation will instantiate a pending security lock. Assets must be manually dispatched to the generated endpoint in the next step.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 pt-0">
                                                        <div className="flex items-center gap-2.5 mb-4 px-1">
                                                            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={setAgreeTerms} className="w-4 h-4 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                                            <Label htmlFor="terms" className="text-[10px] font-bold text-slate-500 cursor-pointer select-none leading-none">
                                                                Authorize contract instantiation & accept risk mandates.
                                                            </Label>
                                                        </div>
                                                        
                                                        <Button
                                                            onClick={handleSubmit}
                                                            disabled={!isValidAmount || !agreeTerms || isSubmitting}
                                                            className="w-full h-14 rounded-2xl bg-[#0f172a] hover:bg-blue-600 text-white font-black shadow-xl shadow-slate-200 text-[11px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 active:scale-[0.98]"
                                                        >
                                                            {isSubmitting ? (
                                                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    Initiate Contract <ArrowRight className="w-4 h-4" />
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </section>
            )}
        </div>
    );
}

export default function InvestPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Buffering Gateway...</p>
            </div>
        }>
            <InvestContent />
        </Suspense>
    );
}
