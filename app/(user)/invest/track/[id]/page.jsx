"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Wallet,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Copy,
    Check,
    ArrowRight,
    Loader2,
    Upload,
    ArrowDownCircle,
    BadgeCheck,
    Home,
    ChevronLeft,
    Clock,
    Shield,
    Activity,
    FileText,
    Zap,
    Building2,
    Lock
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { paymentsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function TrackInvestmentPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const [uploadProof, setUploadProof] = useState(null);
    const [txHash, setTxHash] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState("");

    useEffect(() => {
        if (id) {
            loadRequest();
        }
    }, [id]);

    const loadRequest = async () => {
        try {
            setLoading(true);
            const response = await paymentsApi.getById(id);
            setData(response);
        } catch (err) {
            setError(err.message || "Failed to load investment request");
            toast.error("Request loading failed.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied("wallet");
        setTimeout(() => setCopied(""), 2000);
        toast.success("Address cloned to clipboard");
    };

    const onDrop = (acceptedFiles) => {
        setUploadProof(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [], 'application/pdf': [] },
        multiple: false
    });

    const handleSubmit = async () => {
        if (!uploadProof || !txHash) {
            toast.error("Proof document and Hash ID are mandatory.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('proofDocument', uploadProof);
            formData.append('paymentRequestId', id);
            formData.append('transactionReference', txHash);

            await paymentsApi.uploadProof(formData);
            toast.success("Security dispatch successful!");
            loadRequest(); 
        } catch (err) {
            toast.error(err.message || "Transaction logging failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] animate-pulse">Establishing Secure Protocol...</p>
            </div>
        );
    }

    if (error || !data || !data.paymentRequest) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Payload Access Denied</h2>
                <p className="text-sm font-medium text-slate-500 max-w-xs mb-8">{error || "The specified cryptographic token identifier does not exist in registry."}</p>
                <Button asChild className="bg-[#0f172a] text-white font-bold rounded-xl h-11 px-8 shadow-lg">
                    <Link href="/investments">Return to Dashboard</Link>
                </Button>
            </div>
        );
    }

    const { paymentRequest, paymentDetails } = data;
    const isPending = paymentRequest.status === 'pending';
    const status = paymentRequest.status;
    const amount = paymentRequest.amount || 0;

    const indexInfo = paymentRequest.index || { name: "Manual Deposit System" };
    const isActive = ['approved', 'active', 'verified'].includes(status);
    const isProcessing = ['proof_uploaded', 'submitted'].includes(status);
    const isRejected = status === 'rejected';

    // Determine Stepper progress mapping
    let currentStep = 0; 
    if (isPending) currentStep = 1; 
    else if (isProcessing) currentStep = 2;
    else if (isActive) currentStep = 3;

    const steps = [
        { label: "Pipeline Lock", icon: Building2 },
        { label: "Fund Dispatch", icon: Wallet },
        { label: "Verification", icon: Activity },
        { label: "Deployed", icon: Zap }
    ];

    return (
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
            
            {/* ─── High-End Banner ─── */}
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        isActive ? "bg-emerald-50 text-emerald-600" :
                        isRejected ? "bg-red-50 text-red-600" :
                        isProcessing ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                    )}>
                        {isActive ? <Shield className="w-6 h-6" /> : isProcessing ? <Clock className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black text-slate-900">Track Lifecycle</h1>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                isProcessing ? "bg-blue-50 border-blue-200 text-blue-700" :
                                isRejected ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"
                            )}>
                                {isProcessing ? "In Review" : status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            System Trace ID: <span className="font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">#{id.slice(-8).toUpperCase()}</span>
                        </p>
                    </div>
                </div>

                <Button asChild variant="outline" size="sm" className="rounded-xl h-9 border-slate-200 text-[10px] font-black uppercase tracking-wider gap-2 shadow-sm shrink-0 w-fit">
                    <Link href="/investments">
                        <ChevronLeft className="w-3.5 h-3.5" /> Exit Terminal
                    </Link>
                </Button>
            </div>

            {/* ─── Visual Stepper Pipeline ─── */}
            <div className="px-4 md:px-8">
                <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
                    {/* Background Connection Line */}
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-100 -z-10" />
                    <div 
                        className="absolute left-0 top-5 h-0.5 bg-blue-600 transition-all duration-700 -z-10" 
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((stp, i) => {
                        const Icon = stp.icon;
                        const done = i < currentStep;
                        const current = i === currentStep;
                        
                        return (
                            <div key={i} className="flex flex-col items-center">
                                <motion.div
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: current ? 1.1 : 1 }}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white shadow-sm",
                                        done ? "border-blue-600 bg-blue-600 text-white" : 
                                        current ? "border-blue-600 text-blue-600" : "border-slate-200 text-slate-300"
                                    )}
                                >
                                    {done ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                                </motion.div>
                                <span className={cn(
                                    "absolute mt-12 text-[9px] font-black uppercase tracking-wider whitespace-nowrap",
                                    done ? "text-blue-600" : current ? "text-slate-800" : "text-slate-400"
                                )}>
                                    {stp.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Add explicit Spacer for Absolute text above */}
            <div className="h-8" />

            {/* ─── Main Grid Layout ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column A: Investment Specs */}
                <div className="space-y-6 flex flex-col">
                    <Card className="bg-white rounded-3xl border-slate-100 shadow-sm flex-1 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                        
                        <CardContent className="p-6 space-y-6 relative">
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-1">Specification</p>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{indexInfo.name}</h3>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commitment</span>
                                    <span className="text-lg font-black text-slate-900">${amount.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-slate-200/60" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Rail</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-[#26A17B] flex items-center justify-center text-[8px] font-bold text-white">T</div>
                                        <span className="text-xs font-black text-slate-900">{paymentDetails?.network || "USDT"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    Initialized: {new Date(paymentRequest.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    Escrow Locked Security
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informational Box */}
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Audit Warning</p>
                            <p className="text-[10px] font-semibold text-amber-700/80 leading-relaxed">
                                Verify precision routing. SMC Protocol cannot reverse cryptographic transactions routed outside defined network parameters.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Column B & C: Action Center */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {isPending ? (
                            <motion.div
                                key="pending"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="bg-white rounded-3xl border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden border-t-4 border-t-blue-600">
                                    <CardContent className="p-6 md:p-8 space-y-8">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Awaiting Authentication</h3>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Dispatch exactly <span className="font-black text-slate-800">${amount.toLocaleString()}</span> from your institutional wallet to launch node connectivity.
                                            </p>
                                        </div>

                                        {/* Wallet Segment */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end px-1">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Secured Routing Node (Address)</Label>
                                                <button 
                                                    onClick={() => copyToClipboard(paymentDetails?.walletAddress)}
                                                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1 transition-colors"
                                                >
                                                    <Copy className="w-3 h-3" /> Copy
                                                </button>
                                            </div>
                                            
                                            <div 
                                                onClick={() => copyToClipboard(paymentDetails?.walletAddress)}
                                                className="group relative bg-slate-50 border border-slate-100 hover:border-blue-200 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] overflow-hidden text-center"
                                            >
                                                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors" />
                                                <p className="relative z-10 text-sm md:text-base font-mono font-black text-slate-800 break-all leading-relaxed">
                                                    {paymentDetails?.walletAddress || "ADDRESS_MISSING"}
                                                </p>
                                                
                                                <AnimatePresence>
                                                    {copied === 'wallet' && (
                                                        <motion.div 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="absolute inset-0 bg-blue-600 flex items-center justify-center z-20"
                                                        >
                                                            <span className="text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                                <Check className="w-4 h-4 stroke-[3]" /> Copied to Ledger
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Submission Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Transaction ID / Hash</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        value={txHash}
                                                        onChange={e => setTxHash(e.target.value)}
                                                        placeholder="Enter TX Hash Value"
                                                        className="pl-10 h-12 font-mono text-sm bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Proof Receipt</Label>
                                                <div
                                                    {...getRootProps()}
                                                    className={cn(
                                                        "h-12 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 relative group overflow-hidden",
                                                        uploadProof ? "border-emerald-500 bg-emerald-50/50 text-emerald-600" : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30 text-slate-500",
                                                        isDragActive && "border-blue-600 bg-blue-50"
                                                    )}
                                                >
                                                    <input {...getInputProps()} />
                                                    <div className="flex items-center gap-2.5 px-4 w-full">
                                                        {uploadProof ? <BadgeCheck className="w-5 h-5 shrink-0" /> : <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform shrink-0" />}
                                                        <span className="text-[11px] font-black uppercase tracking-wider truncate flex-1 text-left">
                                                            {uploadProof ? uploadProof.name : "Upload Image/PDF"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleSubmit}
                                            disabled={!uploadProof || !txHash || isSubmitting}
                                            className="w-full h-14 bg-[#0f172a] hover:bg-slate-800 text-white font-black rounded-2xl shadow-lg shadow-slate-200 text-[11px] uppercase tracking-[0.25em] transition-all relative overflow-hidden group disabled:opacity-60"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                            ) : (
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    Commit Node Transaction <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="completed-status"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col"
                            >
                                <Card className="bg-white rounded-3xl border-slate-100 shadow-sm flex-1 flex items-center justify-center overflow-hidden text-center p-8 md:p-12 border-t-4 border-t-blue-600/0 relative">
                                    {/* Dynamic accent border logic based on state implicitly mapped through contents now */}
                                    <CardContent className="space-y-8 max-w-sm">
                                        <div className="relative mx-auto w-28 h-28">
                                            {isActive ? (
                                                <>
                                                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-40" />
                                                    <div className="relative w-28 h-28 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <Shield className="w-12 h-12" />
                                                    </div>
                                                </>
                                            ) : isRejected ? (
                                                <div className="relative w-28 h-28 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                                                    <AlertCircle className="w-12 h-12" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-40" />
                                                    <div className="relative w-28 h-28 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                                        <Activity className="w-12 h-12" />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">
                                                {isActive ? "Liquidity Deployed" :
                                                 isRejected ? "Validation Revoked" :
                                                 "Audit Stream Active"}
                                            </h3>
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                                {isActive ? "Synchronisation complete. Allocated funds are yielding cumulative portfolio growth." :
                                                 isRejected ? "Network operators detected anomalous cryptographic payloads. Please contact direct technical advocacy." :
                                                 "Artificial Intelligence validators are performing algorithmic hashing checksums. Typically verified within a 2-4 hour block."}
                                            </p>
                                        </div>

                                        <Button asChild variant="outline" className="w-full h-12 rounded-2xl border-slate-200 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                                            <Link href="/investments">Manage Portfolios</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
