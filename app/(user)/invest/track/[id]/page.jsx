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
    Shield
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { paymentsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
            toast.error("Failed to load request details");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied("wallet");
        setTimeout(() => setCopied(""), 2000);
        toast.success("Address copied to clipboard");
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
            toast.error("Please provide both transaction hash and proof file");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('proofDocument', uploadProof);
            formData.append('paymentRequestId', id);
            formData.append('transactionReference', txHash);

            await paymentsApi.uploadProof(formData);
            toast.success("Proof submitted successfully!");
            loadRequest(); // Reload to show processing state
        } catch (err) {
            toast.error(err.message || "Failed to submit proof");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Terminal...</p>
                </div>
            </div>
        );
    }

    if (error || !data || !data.paymentRequest) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">Request Not Found</h2>
                    <p className="text-sm text-slate-500 max-w-xs">{error || "The investment request you're looking for doesn't exist or access is restricted."}</p>
                </div>
                <Button asChild variant="default" className="bg-slate-900 hover:bg-black font-bold h-11 px-8 rounded-xl shadow-lg">
                    <Link href="/investments">Back to My Investments</Link>
                </Button>
            </div>
        );
    }

    const { paymentRequest, paymentDetails } = data;
    const isPending = paymentRequest.status === 'pending';
    const status = paymentRequest.status;
    const amount = paymentRequest.amount || 0;

    // Fix: Use index object from API instead of indexId
    const indexInfo = paymentRequest.index || { name: "Investment Index" };
    const indexName = indexInfo.name;

    const isActive = ['approved', 'active', 'verified'].includes(status);
    const isProcessing = ['proof_uploaded', 'submitted'].includes(status);

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
            {/* Compact Breadcrumb Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <Home className="w-3 h-3" />
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/investments" className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors">
                                    Investments
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                    Tracking
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Investment Terminal</h1>
                        <Badge variant="outline" className={cn(
                            "font-bold uppercase tracking-[0.1em] px-2.5 py-1 text-[9px] border-2",
                            isPending ? "bg-amber-50 text-amber-600 border-amber-200" :
                                isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                    isProcessing ? "bg-blue-50 text-blue-600 border-blue-200" :
                                        "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                            {isProcessing ? 'Verifying Receipt' : status.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session ID</p>
                    <p className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">#{id.substring(0, 10).toUpperCase()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Details */}
                <div className="lg:col-span-12 xl:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Card */}
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden md:col-span-1">
                        <CardContent className="p-0">
                            <div className={cn(
                                "h-1.5 w-full",
                                isPending ? "bg-amber-400" : isActive ? "bg-emerald-500" : "bg-blue-500"
                            )} />
                            <div className="p-6 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Investment Plan</p>
                                        <h3 className="text-xl font-black text-slate-900 leading-tight">{indexName}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                        <p className="text-lg font-black text-slate-900">${amount.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1 text-right border-l border-slate-200/60 pl-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network</p>
                                        <p className="text-lg font-black text-slate-900">{paymentDetails?.network || "USDT"}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                                        <Clock className="w-3 h-3" />
                                        Request Logged: {new Date(paymentRequest.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                                        <Shield className="w-3 h-3 text-emerald-500" />
                                        Secured Transaction
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Action Block */}
                    <div className="md:col-span-1">
                        {isPending ? (
                            <Card className="border-none shadow-xl shadow-blue-500/5 bg-white h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Wallet className="w-24 h-24 text-blue-600" />
                                </div>
                                <div className="p-6 space-y-6 relative h-full flex flex-col">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em] flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                            Action Required
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                            Transfer exactly <span className="text-blue-600 font-black">${amount.toLocaleString()}</span> to the address below.
                                        </p>
                                    </div>

                                    <div className="space-y-4 flex-grow">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Destination</Label>
                                                <button onClick={() => copyToClipboard(paymentDetails?.walletAddress)} className="text-[9px] font-black text-blue-600 uppercase tracking-wider hover:underline transition-all active:scale-95">Copy Address</button>
                                            </div>
                                            <div
                                                onClick={() => copyToClipboard(paymentDetails?.walletAddress)}
                                                className="group relative bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-blue-500/30 rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] shadow-sm"
                                            >
                                                <p className="text-xs font-mono font-bold text-slate-700 break-all text-center leading-relaxed">
                                                    {paymentDetails?.walletAddress || "Address not available"}
                                                </p>
                                                {copied === 'wallet' && (
                                                    <div className="absolute inset-0 bg-blue-600 flex items-center justify-center rounded-2xl animate-in fade-in zoom-in duration-200">
                                                        <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                            <CheckCircle className="w-3.5 h-3.5" /> Address Copied
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">TX Hash (TXID)</Label>
                                                <Input
                                                    value={txHash}
                                                    onChange={(e) => setTxHash(e.target.value)}
                                                    placeholder="0x..."
                                                    className="h-12 font-mono text-sm border-2 border-slate-100 bg-white focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Proof Document</Label>
                                                <div
                                                    {...getRootProps()}
                                                    className={cn(
                                                        "h-12 border-2 border-dashed rounded-xl flex items-center justify-center transition-all cursor-pointer",
                                                        uploadProof ? "border-emerald-500 bg-emerald-50/30 text-emerald-600" : "border-slate-100 bg-white hover:border-blue-400 text-slate-400",
                                                        isDragActive && "border-blue-500 bg-blue-50"
                                                    )}
                                                >
                                                    <input {...getInputProps()} />
                                                    <div className="flex items-center gap-2 px-3">
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                                                            {uploadProof ? <BadgeCheck className="w-5 h-5" /> : <Upload className="w-4 h-4" />}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[80px]">
                                                            {uploadProof ? uploadProof.name : "Attach Receipt"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl shadow-xl shadow-blue-500/20 text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
                                            onClick={handleSubmit}
                                            disabled={!uploadProof || !txHash || isSubmitting}
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Complete Terminal"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden h-full flex items-center justify-center">
                                <CardContent className="p-10 text-center space-y-6">
                                    <div className="relative mx-auto w-24 h-24">
                                        {isActive ? (
                                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                                        ) : isProcessing ? (
                                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-40" />
                                        ) : null}
                                        <div className={cn(
                                            "relative w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4",
                                            isActive ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                                                status === 'rejected' ? "bg-red-50 border-red-100 text-red-500" :
                                                    "bg-blue-50 border-blue-100 text-blue-500"
                                        )}>
                                            {isActive ? <CheckCircle className="w-10 h-10" /> :
                                                status === 'rejected' ? <AlertCircle className="w-10 h-10" /> :
                                                    <Loader2 className="w-10 h-10 animate-spin" />}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                            {isActive ? "Investment Deployed" :
                                                status === 'rejected' ? "Request Flagged" :
                                                    "Analyzing Network Proof"}
                                        </h3>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-[240px] mx-auto uppercase tracking-wide opacity-80">
                                            {isActive ? "Success. Your funds are now mapped to the selected index terminal." :
                                                status === 'rejected' ? "The proof provided was invalid. Please contact support." :
                                                    "The index is verifying your transaction hash. Verification is usually complete within 2-4 hours."}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button asChild variant="outline" className="border-2 font-black text-[10px] uppercase tracking-widest h-11 rounded-xl">
                                            <Link href="/investments">All Investments</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Bottom Row / Compact Info */}
                <div className="lg:col-span-12 space-y-4">
                    <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1 leading-none">Protocol Advisory</p>
                            <p className="text-[10px] text-amber-800/80 font-bold leading-relaxed">
                                Always ensure you are on the <span className="underline font-black">BEP20</span> or <span className="underline font-black">TRC20</span> network as specified. Assets sent to incorrect addresses or networks cannot be recovered by the SMC Protocol.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
