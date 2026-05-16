"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    CheckCircle2,
    Wallet,
    FileText,
    CreditCard,
    TrendingUp,
    Calendar,
    Clock,
    AlertTriangle,
    Copy,
    ArrowDownCircle,
    Download,
    BadgeCheck,
    Building2,
    MessageSquare,
    ArrowLeft,
    ShieldCheck,
    Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useIndex } from "@/hooks/useApi";
import { paymentsApi } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import dynamic from 'next/dynamic';
import { useDropzone } from "react-dropzone";

const QRCodeSVG = dynamic(() => import("qrcode.react").then(mod => mod.QRCodeSVG), { ssr: false });

const CompactHeader = ({ name, currentStep, id }) => {
    const steps = ["Amount", "Review", "Payment", "Success"];
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/indices/${id}`}
                        className="p-2 ml-[-8px] rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Complete Investment</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{name} Index</p>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Step {currentStep} of 4</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{steps[currentStep - 1]}</p>
                </div>
            </div>

            {/* Slim Progress Bar */}
            <div className="relative w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 4) * 100}%` }}
                    className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                />
            </div>
        </div>
    );
};

const SummarySidebar = ({ amount, weeklyReturn, monthlyReturn, index, duration, currentStep }) => {
    return (
        <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-slate-900 dark:bg-blue-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative border border-white/5">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-20 h-20" />
                </div>
                <h4 className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-6 border-b border-white/10 pb-3 relative z-10">Live Projections</h4>
                <div className="space-y-6 relative z-10">
                    <div>
                        <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-1">Weekly Payout</p>
                        <p className="text-3xl font-bold text-emerald-400">${weeklyReturn.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                        <div>
                            <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-1">Monthly</p>
                            <p className="text-base font-bold">${monthlyReturn.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-1">Yearly</p>
                            <p className="text-base font-bold text-emerald-400">${(monthlyReturn * 12).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b dark:border-white/5 pb-3">Investment Summary</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Principal</span>
                        <span className="text-slate-900 dark:text-white font-bold">${amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Index</span>
                        <span className="text-slate-900 dark:text-white font-bold uppercase tracking-tighter">{index.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Duration</span>
                        <span className="text-slate-900 dark:text-white font-bold">{duration === "flexible" ? "Flexible" : duration}</span>
                    </div>
                    {currentStep > 1 && (
                        <div className="pt-3 border-t dark:border-white/5 flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Service Fee</span>
                            <span className="text-emerald-500 font-black uppercase tracking-widest">0% Free</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                <div className="flex gap-3">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-1">Audited Deployment</p>
                        <p className="text-[9px] font-medium text-blue-700/70 dark:text-blue-300/60 leading-relaxed">Funds are strictly settled on-chain with verified bank-grade custody proofs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function InvestPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();

    const { index, loading, error } = useIndex(id);

    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(index?.minInvestment || 100);
    const [duration, setDuration] = useState("flexible");
    const [acceptedTerms, setAcceptedTerms] = useState({
        varies: false,
        terms: false,
        ownFunds: false,
        risk: false,
    });

    const [paymentMethod, setPaymentMethod] = useState("bep20_usdt");
    const [transactionReference, setTransactionReference] = useState("");
    const [uploadProof, setUploadProof] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Crypto Settlement Details
    const [paymentRequestId, setPaymentRequestId] = useState(null);
    const [paymentRequestData, setPaymentRequestData] = useState(null); // Store full response with address

    const currentRate = (index?.currentReturnRate || 4.5) / 100;
    const weeklyReturn = Math.round(amount * currentRate);
    const monthlyReturn = weeklyReturn * 4;

    const nextStep = () => {
        // Validation per step
        if (step === 1) {
            if (amount < (index?.minInvestment || 100)) {
                toast.error(`Minimum investment is $${(index?.minInvestment || 100).toLocaleString()}`);
                return;
            }
            if (amount > (index?.maxInvestment || 1000000)) {
                toast.error(`Maximum investment is $${(index?.maxInvestment || 1000000).toLocaleString()}`);
                return;
            }
        }

        if (step === 2) {
            const allAccepted = Object.values(acceptedTerms).every(v => v === true);
            if (!allAccepted) {
                toast.error("Please accept all agreements to continue");
                return;
            }
        }

        setStep(s => Math.min(s + 1, 4));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const prevStep = () => {
        setStep(s => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCreateRequest = async () => {
        setIsSubmitting(true);
        try {
            const targetIndexId = index?._id || index?.id;
            const response = await paymentsApi.createRequest({
                indexId: targetIndexId,
                amount,
                duration,
                paymentMethod,
            });

            if (response && response.paymentDetails) {
                setPaymentRequestData(response);
                // Also set legacy ID state just in case
                setPaymentRequestId(response.id || response._id);
                toast.success("Payment details generated.");
            } else {
                toast.error("Failed to generate payment details.");
            }
        } catch (error) {
            console.error("Create Request Error:", error);
            toast.error(error.message || "Failed to create request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!uploadProof) {
            toast.error("Please upload payment proof first");
            return;
        }

        if (!transactionReference.trim()) {
            toast.error("Please enter transaction reference number");
            return;
        }

        if (!paymentRequestData) {
            toast.error("Session expired. Please restart.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('proofDocument', uploadProof);
            formData.append('paymentRequestId', paymentRequestData.id || paymentRequestData._id);
            formData.append('transactionReference', transactionReference);

            const uploadRes = await paymentsApi.uploadProof(formData);

            if (uploadRes) {
                toast.success("Investment submitted successfully!");
                nextStep();
            } else {
                throw new Error("Proof upload failed. Please contact support.");
            }
        } catch (error) {
            console.error("Investment error:", error);
            toast.error(error.message || "Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setUploadProof(file);
        // We no longer upload automatically here to ensure it's linked to the request created in handleInvest
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [], 'application/pdf': [] },
        multiple: false
    });

    if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 text-center text-slate-500 font-bold uppercase tracking-widest">Loading...</div>;
    if (error || !index) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 text-center text-red-500 font-black uppercase tracking-widest">Error Loading Index</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-6 relative overflow-hidden">
                {/* Subtle Background Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-blue-600/5 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)] -z-10"></div>

                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT: Main Content (Step Flow) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-blue-500/5 overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <CompactHeader
                                        name={index.name}
                                        currentStep={step}
                                        id={id}
                                    />

                                    <AnimatePresence mode="wait">
                                        {step === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-8"
                                            >
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                            <Wallet className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                                            Investment Amount
                                                        </h3>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="relative">
                                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                                                            <Input
                                                                type="number"
                                                                value={amount}
                                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                                className="h-14 pl-10 text-2xl font-bold rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50 dark:bg-white/5 transition-all outline-none"
                                                            />
                                                            <p className="mt-2 text-[10px] font-bold text-blue-600/60 uppercase tracking-widest ml-1">
                                                                Minimum Investment: ${(index?.minInvestment || 100).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2">
                                                            {[10000, 25000, 50000, 100000, 250000, 500000].map((val) => (
                                                                <button
                                                                    key={val}
                                                                    onClick={() => setAmount(val)}
                                                                    className={cn(
                                                                        "py-2.5 rounded-xl border transition-all text-xs font-bold text-center",
                                                                        amount === val
                                                                            ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]"
                                                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-blue-500/50"
                                                                    )}
                                                                >
                                                                    ${(val / 1000).toFixed(0)}K
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="px-2">
                                                            <Slider
                                                                value={[amount]}
                                                                onValueChange={(v) => setAmount(v[0])}
                                                                max={index?.maxInvestment || 1000000}
                                                                min={index?.minInvestment || 100}
                                                                step={5000}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4">
                                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration Plan</h3>
                                                    <div className="grid sm:grid-cols-3 gap-3">
                                                        {[
                                                            { id: "flexible", label: "Flexible", sub: "Withdraw Anytime", bonus: "Standard" }
                                                        ].map(d => (
                                                            <button
                                                                key={d.id}
                                                                onClick={() => setDuration(d.id)}
                                                                className={cn(
                                                                    "p-4 rounded-xl border text-left transition-all",
                                                                    duration === d.id
                                                                        ? "bg-blue-600 border-transparent shadow-md ring-2 ring-blue-500/20"
                                                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5"
                                                                )}
                                                            >
                                                                <p className={cn("text-sm font-bold", duration === d.id ? "text-white" : "text-slate-900 dark:text-white")}>{d.label}</p>
                                                                <p className={cn("text-[9px] font-medium", duration === d.id ? "text-blue-100/70" : "text-slate-500")}>{d.sub}</p>
                                                                <Badge className={cn("mt-3 font-bold border-none text-[8px] h-5", duration === d.id ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600")}>{d.bonus}</Badge>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                                        Audit Agreements
                                                    </h3>
                                                </div>

                                                <div className="space-y-3">
                                                    {[
                                                        { id: "varies", label: "Returns vary between 2-5% weekly based on throughput" },
                                                        { id: "terms", label: "I agree to the Investment Terms & Conditions" },
                                                        { id: "ownFunds", label: "Principal consists of legitimate/verified funds only" },
                                                        { id: "risk", label: "I acknowledge the inherent volatility risks" }
                                                    ].map(item => (
                                                        <div
                                                            key={item.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group",
                                                                acceptedTerms[item.id] ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20" : "bg-slate-50 dark:bg-white/2 border-slate-100 dark:border-white/5 whitespace-normal"
                                                            )}
                                                            onClick={() => setAcceptedTerms(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                        >
                                                            <Checkbox checked={acceptedTerms[item.id]} className="shrink-0" />
                                                            <span className={cn(
                                                                "text-xs font-bold transition-colors",
                                                                acceptedTerms[item.id] ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                                                            )}>
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Expected Deployment</p>
                                                        <p className="text-[10px] font-bold text-emerald-600 underline cursor-pointer">View Schedule</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-emerald-700/60 uppercase tracking-tight">Weekly Return Base</span>
                                                        <span className="text-base font-black text-emerald-600">${weeklyReturn.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                {!paymentRequestData ? (
                                                    /* Phase 1: Network Selection */
                                                    <div className="space-y-6">
                                                        <div className="text-center space-y-2">
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Payment Network</h3>
                                                            <p className="text-xs text-slate-500">Choose your preferred blockchain network for USDT transfer</p>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {[
                                                                { id: 'bep20_usdt', label: 'BNB Smart Chain', network: 'BEP20', fee: '~$0.03' },
                                                                { id: 'trc20_usdt', label: 'TRON Network', network: 'TRC20', fee: '~$1.00' }
                                                            ].map((net) => (
                                                                <div
                                                                    key={net.id}
                                                                    onClick={() => setPaymentMethod(net.id)}
                                                                    className={cn(
                                                                        "relative cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-[1.02]",
                                                                        paymentMethod === net.id
                                                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                                            : "border-slate-100 dark:border-white/5 hover:border-blue-200"
                                                                    )}
                                                                >
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <Badge variant="outline" className={cn(
                                                                            "font-bold px-2 py-1",
                                                                            paymentMethod === net.id ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-600"
                                                                        )}>
                                                                            {net.network}
                                                                        </Badge>
                                                                        {paymentMethod === net.id && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                                                                    </div>
                                                                    <p className="font-bold text-slate-900 dark:text-white text-lg">{net.label}</p>
                                                                    <p className="text-xs text-slate-500 mt-2">Provider Fee: {net.fee}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Instant Settlement</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-3">
                                                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-bold text-amber-800 dark:text-amber-500">Important</p>
                                                                <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                                                                    Ensure you select the correct network. Sending funds to the wrong network may result in permanent loss.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Phase 2: Payment Details & Proof */
                                                    <div className="space-y-6 pt-2 animate-in fade-in duration-500">
                                                        <div className="flex flex-col md:flex-row gap-6 bg-slate-50 dark:bg-white/2 rounded-2xl p-6 border border-slate-100 dark:border-white/5">
                                                            <div className="p-3 bg-white rounded-xl shrink-0 self-center md:self-start shadow-sm flex flex-col items-center gap-2">
                                                                <QRCodeSVG value={paymentRequestData.paymentDetails.walletAddress} size={140} />
                                                                <p className="text-[8px] font-black text-slate-400">SCAN TO DEPOSIT</p>
                                                            </div>
                                                            <div className="space-y-4 flex-1">
                                                                <div className="flex justify-between items-center bg-blue-500/5 p-2 px-3 rounded-lg border border-blue-500/10">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Awaiting Deposit</p>
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-slate-500">{paymentRequestData.paymentDetails.network}</p>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement Address</p>
                                                                    <div className="flex items-center gap-2 group">
                                                                        <p className="text-xs font-black text-slate-900 dark:text-white break-all bg-white dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5 flex-1">
                                                                            {paymentRequestData.paymentDetails.walletAddress}
                                                                        </p>
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="icon"
                                                                            onClick={() => { navigator.clipboard.writeText(paymentRequestData.paymentDetails.walletAddress); toast.success("Address Copied"); }}
                                                                            className="shrink-0 size-11 rounded-xl shadow-sm"
                                                                        >
                                                                            <Copy size={16} />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex gap-3">
                                                                    <div className="bg-amber-500 text-white p-1 rounded-md shrink-0 self-start">
                                                                        <ArrowDownCircle size={10} className="rotate-180" />
                                                                    </div>
                                                                    <p className="text-[9px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                                                                        Send EXACTLY <span className="font-black">${amount.toLocaleString()} USDT</span> via {paymentRequestData.paymentDetails.network}.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="space-y-4">
                                                                <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Transaction Hash (TxHash)</label>
                                                                    <Input
                                                                        value={transactionReference}
                                                                        onChange={(e) => setTransactionReference(e.target.value)}
                                                                        placeholder="Paste 64-character hash"
                                                                        className="h-10 text-sm font-bold bg-slate-50/50"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div
                                                                    {...getRootProps()}
                                                                    className={cn(
                                                                        "h-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer",
                                                                        uploadProof ? "bg-emerald-500/5 border-emerald-500/50" : "bg-slate-50/50 border-slate-200 dark:border-white/10 hover:border-blue-500/50"
                                                                    )}
                                                                >
                                                                    <input {...getInputProps()} />
                                                                    {uploadProof ? (
                                                                        <div className="flex flex-col items-center text-center">
                                                                            <BadgeCheck className="w-6 h-6 text-emerald-500 mb-1" />
                                                                            <p className="text-[10px] font-bold text-emerald-600 line-clamp-1">{uploadProof.name}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center text-center">
                                                                            <ArrowDownCircle className="w-6 h-6 text-slate-300 mb-1" />
                                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Settle Proof</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {step === 4 && (
                                            <motion.div
                                                key="step4"
                                                initial={{ scale: 0.95, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="flex flex-col items-center text-center py-6 space-y-6"
                                            >
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center relative z-10 shadow-lg shadow-emerald-500/20">
                                                        <CheckCircle2 className="w-8 h-8" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping z-0 scale-125 blur-lg"></div>
                                                </div>

                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Deployment active</h3>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">REF: #SMC-ID-{id.toUpperCase().substring(0, 8)}</p>
                                                </div>

                                                <div className="w-full space-y-2">
                                                    {[
                                                        { title: "Proof Verification", sub: "ETA: 4 Hours", active: true },
                                                        { title: "Index Settle", sub: "Same Business Day", active: false },
                                                        { title: "Live Yields", sub: "Next Friday, 18:00", active: false }
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn("w-2 h-2 rounded-full", item.active ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-200")} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{item.title}</span>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-slate-400">{item.sub}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 w-full pt-4">
                                                    <Button asChild className="flex-[2] rounded-xl h-12 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-xs uppercase tracking-widest">
                                                        <Link href="/investments">Monitor Performance</Link>
                                                    </Button>
                                                    <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold border-slate-200 dark:border-white/10 text-[9px] uppercase tracking-widest">
                                                        Receipt
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Footer Navigation */}
                                {step < 4 && (
                                    <div className="px-6 py-6 md:px-8 bg-slate-50/50 dark:bg-white/2 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex gap-4 justify-between items-center">
                                            {step > 1 ? (
                                                <Button
                                                    variant="ghost"
                                                    onClick={prevStep}
                                                    className="h-10 font-black text-[10px] uppercase tracking-widest text-slate-400"
                                                >
                                                    Back
                                                </Button>
                                            ) : <div />}

                                            <Button
                                                onClick={step === 3 ? (paymentRequestData ? handleConfirmPayment : handleCreateRequest) : nextStep}
                                                disabled={isSubmitting || (step === 2 && Object.values(acceptedTerms).includes(false)) || (step === 3 && ((paymentRequestData && (!uploadProof || !transactionReference)) || (!paymentRequestData && !paymentMethod)))}
                                                className={cn(
                                                    "rounded-xl h-12 px-10 font-black text-xs uppercase tracking-widest shadow-xl transition-all",
                                                    step === 3 ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                                                )}
                                            >
                                                {step === 1 ? "Next Step" : step === 2 ? "Confirm Details" : step === 3 && !paymentRequestData ? "Generate Address" : isSubmitting ? "Settle..." : "Confirm Payment"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-8">
                                SECURE END-TO-END DEPLOYMENT • SMC PROTOCOL V2.4
                            </p>
                        </div>

                        {/* RIGHT: Summary Sidebar */}
                        <div className="lg:col-span-4">
                            <SummarySidebar
                                amount={amount}
                                weeklyReturn={weeklyReturn}
                                monthlyReturn={monthlyReturn}
                                index={index}
                                duration={duration}
                                currentStep={step}
                            />
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
