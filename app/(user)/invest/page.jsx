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
    Home,
    Loader2,
    Lock,
    Upload,
    ArrowDownCircle,
    BadgeCheck // Added this
} from "lucide-react";
import { useDropzone } from "react-dropzone";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useIndices, useInvestmentSummary } from "@/hooks/useApi";
import { paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Suspense } from "react";

function InvestContent() {
    const searchParams = useSearchParams();
    const indexIdFromUrl = searchParams.get("index");

    const { user } = useAuthStore();
    const kycStatus = user?.kycStatus;
    const { indices, loading: indicesLoading, error: indicesError } = useIndices();
    const { data: summaryData } = useInvestmentSummary();

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [amount, setAmount] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [copied, setCopied] = useState("");
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("bep20_usdt");
    const [paymentRequestId, setPaymentRequestId] = useState(null);
    const [uploadProof, setUploadProof] = useState(null);
    const [txHash, setTxHash] = useState("");
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [proofSubmitted, setProofSubmitted] = useState(false);

    // Handle pre-selected index from URL
    useEffect(() => {
        if (indices && indexIdFromUrl) {
            const found = indices.find(idx => (idx.id || idx._id) === indexIdFromUrl);
            if (found) {
                setSelectedIndex(found);
                setDialogOpen(true);
            }
        }
    }, [indices, indexIdFromUrl]);

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value) {
            setAmount(parseInt(value).toLocaleString());
        } else {
            setAmount("");
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(""), 2000);
    };

    const handleSubmit = async () => {
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

            setPaymentDetails(result.paymentDetails);
            setPaymentRequestId(result.id || result._id);
            setShowSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to create investment request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDrop = (acceptedFiles) => {
        setUploadProof(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [], 'application/pdf': [] },
        multiple: false
    });

    const handleProofSubmit = async () => {
        if (!uploadProof || !txHash || !paymentRequestId) return;

        setIsUploadingProof(true);
        try {
            const formData = new FormData();
            formData.append('proofDocument', uploadProof);
            formData.append('paymentRequestId', paymentRequestId);
            formData.append('transactionReference', txHash);

            await paymentsApi.uploadProof(formData);
            toast.success("Proof submitted successfully!");
            setProofSubmitted(true);
        } catch (err) {
            const msg = err.message || 'Failed to upload proof';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsUploadingProof(false);
        }
    };

    const resetForm = () => {
        setSelectedIndex(null);
        setAmount("");
        setAgreeTerms(false);
        setShowSuccess(false);
        setPaymentDetails(null);
        setPaymentRequestId(null);
        setUploadProof(null);
        setTxHash("");
        setProofSubmitted(false);
        setError(null);
        setDialogOpen(false);
        setPaymentMethod("bep20_usdt");
    };

    if (indicesLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (indicesError) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load indices</p>
                </div>
            </div>
        );
    }

    // const indices = indicesData?.indices || []; // Removed redundant declaration
    const walletBalance = summaryData?.walletBalance || 0;

    const currentMin = selectedIndex?.minInvestment || 0;
    const parsedAmount = parseInt(amount.replace(/,/g, "")) || 0;
    const isValidAmount = parsedAmount >= currentMin;

    // Map colors for indices
    const colorVariants = [
        { gradient: "from-[#2563eb] to-[#7c3aed]", accentColor: "bg-[#2563eb]" },
        { gradient: "from-[#10b981] to-[#059669]", accentColor: "bg-[#10b981]" },
        { gradient: "from-[#7c3aed] to-[#c026d3]", accentColor: "bg-[#7c3aed]" },
        { gradient: "from-[#f59e0b] to-[#ea580c]", accentColor: "bg-[#f59e0b]" },
    ];

    return (
        <div className="space-y-4 max-w-7xl mx-auto pt-0 pb-2 md:pb-4 px-2 md:px-1">
            {/* Breadcrumb Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                                Investment Indices
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="bg-white border rounded-lg px-3 py-1 flex items-center gap-2.5 shadow-sm mr-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Your Balance</p>
                        <p className="text-xs font-bold text-gray-900 leading-tight">${walletBalance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* KYC Warning */}
            {kycStatus !== 'approved' && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-yellow-800 tracking-tight">KYC Required</p>
                            <p className="text-[10px] text-yellow-700/80">Complete KYC verification to start investing.</p>
                        </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="text-yellow-800 hover:bg-yellow-100 font-bold text-[10px] shrink-0 h-7 px-2">
                        <Link href="/kyc">Complete Now</Link>
                    </Button>
                </div>
            )}

            {/* No Indices */}
            {indices.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No investment indices available at the moment.</p>
                </div>
            )}

            {/* Grid of Indices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {indices.map((idx, index) => {
                    const colors = colorVariants[index % colorVariants.length];
                    return (
                        <Card key={idx.id || idx._id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full bg-white">
                            <div className={`h-1.5 w-full bg-gradient-to-r ${colors.gradient}`} />
                            <CardHeader className="py-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="bg-gray-50 text-gray-600 border-gray-100 font-bold text-[9px]">
                                        {idx.riskLevel?.charAt(0).toUpperCase() + idx.riskLevel?.slice(1)} Risk
                                    </Badge>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Weekly ROI</p>
                                        <p className="text-lg font-black text-green-600 leading-none">{idx.currentReturnRate}%</p>
                                    </div>
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-900 mt-2">{idx.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min. Invest</p>
                                        <p className="text-sm font-bold text-gray-900">${(idx.minInvestment || 0).toLocaleString()}</p>
                                    </div>
                                    {idx.lockPeriod && (
                                        <div className="text-right space-y-0.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lock Period</p>
                                            <div className="flex items-center justify-end gap-1 text-sm font-bold text-gray-900">
                                                <Lock className="w-3 h-3 text-gray-400" />
                                                {idx.lockPeriod}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-0">
                                <Dialog open={dialogOpen && (selectedIndex?.id === idx.id || selectedIndex?._id === idx._id)} onOpenChange={(open) => {
                                    setDialogOpen(open);
                                    if (!open) resetForm();
                                }}>
                                    {kycStatus !== 'approved' ? (
                                        <Button
                                            asChild
                                            className="w-full font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white h-10"
                                        >
                                            <Link href="/kyc" className="flex items-center justify-center w-full">
                                                Complete KYC First
                                                <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <DialogTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    setSelectedIndex(idx);
                                                    setDialogOpen(true);
                                                }}
                                                className="w-full font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white h-10"
                                            >
                                                Start Investment
                                                <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                                            </Button>
                                        </DialogTrigger>
                                    )}
                                    <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl bg-white">
                                        {showSuccess && paymentDetails ? (
                                            proofSubmitted ? (
                                                <div className="py-8 px-6 animate-in fade-in zoom-in duration-300 text-center">
                                                    <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                                        <CheckCircle className="w-8 h-8" />
                                                    </div>
                                                    <h2 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Submitted!</h2>
                                                    <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">
                                                        Proof uploaded successfully. Verification takes ~2-4 hours. Ref: <span className="font-mono text-slate-700">#{paymentRequestId?.substring(0, 8)}</span>
                                                    </p>
                                                    <div className="space-y-2">
                                                        <Button
                                                            asChild
                                                            className="w-full bg-slate-900 hover:bg-black font-bold h-11 rounded-xl text-xs uppercase tracking-widest shadow-lg"
                                                        >
                                                            <Link href="/investments">Track Status</Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={resetForm}
                                                            className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-slate-600"
                                                        >
                                                            Close Window
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col h-full bg-slate-50/50">
                                                    <div className="p-5 bg-white border-b border-slate-100">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                                    <Wallet className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <DialogTitle className="text-sm font-black text-slate-900 uppercase tracking-wide">Deposit Details</DialogTitle>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{paymentDetails.network}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                                                Active
                                                            </Badge>
                                                        </div>

                                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                                                            <span className="text-lg font-black text-slate-900 tracking-tight">${(paymentDetails.amount || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="px-5 pb-0">
                                                        {error && (
                                                            <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-xl text-[10px] font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                                                                {error}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-5 pt-2 space-y-5">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center px-1">
                                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Wallet Address <span className="text-red-500">*</span></Label>
                                                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider cursor-pointer hover:underline" onClick={() => copyToClipboard(paymentDetails.walletAddress, 'wallet')}>Tap to copy</span>
                                                            </div>
                                                            <div
                                                                onClick={() => copyToClipboard(paymentDetails.walletAddress, 'wallet')}
                                                                className="group relative bg-white border border-slate-200 hover:border-blue-500/30 rounded-xl p-3 cursor-pointer transition-all active:scale-[0.98]"
                                                            >
                                                                <p className="text-xs font-mono font-bold text-slate-700 break-all text-center leading-relaxed">
                                                                    {paymentDetails.walletAddress}
                                                                </p>
                                                                {copied === 'wallet' && (
                                                                    <div className="absolute inset-0 bg-blue-600 flex items-center justify-center rounded-xl animate-in fade-in duration-200">
                                                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                                                            <Check className="w-3 h-3" /> Copied
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Upload Proof <span className="text-red-500">*</span></Label>

                                                            <div className="grid gap-3">
                                                                <Input
                                                                    value={txHash}
                                                                    onChange={(e) => setTxHash(e.target.value)}
                                                                    placeholder="Paste Transaction Hash (TxID)"
                                                                    className="h-10 text-[10px] font-bold bg-white border-slate-200 rounded-lg placeholder:text-slate-400 font-mono"
                                                                />

                                                                <div
                                                                    {...getRootProps()}
                                                                    className={cn(
                                                                        "h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer bg-white",
                                                                        uploadProof ? "border-emerald-500/50 bg-emerald-50/10" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/5",
                                                                        isDragActive && "border-blue-500 bg-blue-50/50"
                                                                    )}
                                                                >
                                                                    <input {...getInputProps()} />
                                                                    {uploadProof ? (
                                                                        <div className="text-center px-4">
                                                                            <BadgeCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                                                            <p className="text-[10px] font-bold text-emerald-600 truncate max-w-[180px]">{uploadProof.name}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center">
                                                                            <Upload className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Upload Receipt</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-2">
                                                            <Button
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-11 rounded-xl shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                                                onClick={handleProofSubmit}
                                                                disabled={!uploadProof || !txHash || isUploadingProof || !paymentRequestId}
                                                            >
                                                                {isUploadingProof ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Submit"}
                                                            </Button>
                                                            <button onClick={resetForm} className="w-full text-center mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex flex-col h-full bg-white">
                                                <div className="px-6 pt-6 pb-2">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <DialogTitle className="text-sm font-black text-slate-900 uppercase tracking-wide">Configure Investment</DialogTitle>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                                Index: <span className="text-blue-600">{selectedIndex?.name}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="px-6 py-4 space-y-5">
                                                    {error && (
                                                        <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-[10px] font-bold">
                                                            {error}
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Investment Amount <span className="text-red-500">*</span></Label>
                                                        <div className="relative group">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-300 group-focus-within:text-blue-600 transition-colors">$</span>
                                                            <Input
                                                                value={amount}
                                                                onChange={handleAmountChange}
                                                                placeholder="0"
                                                                className="h-14 pl-9 text-xl font-black border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                                                            />
                                                            {!isValidAmount && amount && (
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                                                                    Min: ${selectedIndex?.minInvestment?.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Select Network <span className="text-red-500">*</span></Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {['bep20_usdt', 'trc20_usdt'].map(net => (
                                                                <button
                                                                    key={net}
                                                                    onClick={() => setPaymentMethod(net)}
                                                                    className={cn(
                                                                        "relative p-3 rounded-xl border-2 text-left transition-all duration-200 group",
                                                                        paymentMethod === net ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                                                                    )}
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors", paymentMethod === net ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                                                                            <TrendingUp className="w-3 h-3" />
                                                                        </div>
                                                                        {paymentMethod === net && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                                    </div>
                                                                    <p className={cn("text-[10px] font-black uppercase tracking-wider mb-0.5", paymentMethod === net ? "text-blue-700" : "text-slate-600")}>
                                                                        {net === 'bep20_usdt' ? 'BNB Smart Chain' : 'TRON Network'}
                                                                    </p>
                                                                    <p className="text-[9px] text-slate-400 font-bold">USDT</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="bg-amber-50/50 rounded-xl p-3 flex gap-3 border border-amber-100">
                                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                        <p className="text-[10px] text-amber-800/80 leading-relaxed font-medium">
                                                            <span className="font-bold">Note:</span> This is an offline transaction. Transfer funds manually after confirming.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-6 pt-2 bg-white">
                                                    <div className="flex items-center gap-2 mb-4 px-1">
                                                        <Checkbox id="terms" checked={agreeTerms} onCheckedChange={setAgreeTerms} className="w-4 h-4 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                                        <Label htmlFor="terms" className="text-[10px] font-bold text-slate-500 cursor-pointer select-none flex items-center gap-1">
                                                            I accept the investment terms & risks <span className="text-red-500">*</span>
                                                        </Label>
                                                    </div>
                                                    <Button
                                                        onClick={handleSubmit}
                                                        disabled={!isValidAmount || !agreeTerms || isSubmitting}
                                                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        {isSubmitting ? (
                                                            <span className="flex items-center gap-2">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Processing...
                                                            </span>
                                                        ) : "Confirm Investment"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>


        </div>
    );
}

export default function InvestPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <InvestContent />
        </Suspense>
    );
}
