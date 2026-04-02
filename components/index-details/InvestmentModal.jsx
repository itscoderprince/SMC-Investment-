"use client";

import { useState, useEffect } from "react";
import {
    X,
    Wallet,
    FileText,
    CreditCard,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Info,
    AlertTriangle,
    Copy,
    Download,
    Clock,
    TrendingUp,
    ArrowDownCircle,
    Building2,
    Phone,
    MessageSquare,
    BadgeCheck,
    Share2,
    Calendar
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { useDropzone } from "react-dropzone";
import { paymentsApi } from "@/lib/api";

const StepTracker = ({ currentStep }) => {
    const steps = [
        { id: 1, label: "Choose Amount" },
        { id: 2, label: "Review Details" },
        { id: 3, label: "Payment Method" },
        { id: 4, label: "Confirmation" },
    ];

    return (
        <div className="w-full py-8 px-4 flex justify-between relative mb-8">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-100 dark:bg-white/5 -translate-y-1/2 mx-12 z-0"></div>
            <div
                className="absolute top-1/2 left-12 h-[2px] bg-blue-600 transition-all duration-500 -translate-y-1/2 z-0"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * (100 - (24 * 100 / 800))}%` }}
            ></div>

            {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                            isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                                isActive ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110" :
                                    "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400"
                        )}>
                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-sm font-black">{step.id}</span>}
                            {isActive && <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping -z-10"></span>}
                        </div>
                        <span className={cn(
                            "absolute top-12 text-[10px] sm:text-xs font-bold whitespace-nowrap uppercase tracking-widest transition-colors",
                            isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                        )}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const InvestmentModal = ({ isOpen, onClose, indexData }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(25000);
    const [duration, setDuration] = useState("flexible");
    const [acceptedTerms, setAcceptedTerms] = useState({
        varies: false,
        terms: false,
        ownFunds: false,
        risk: false,
    });
    const [paymentMethod, setPaymentMethod] = useState("bank");
    const [uploadProof, setUploadProof] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentRequestId, setPaymentRequestId] = useState(null);
    const [paymentError, setPaymentError] = useState(null);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const currentRate = 0.045; // 4.5%
    const weeklyReturn = Math.round(amount * currentRate);
    const monthlyReturn = weeklyReturn * 4;
    const threeMonthReturn = weeklyReturn * 12;

    const handleClose = () => {
        if (step > 1 && step < 4) {
            if (confirm("Are you sure you want to cancel your investment process? Your progress will be saved.")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleInvest = async () => {
        setIsSubmitting(true);
        setPaymentError(null);

        try {
            // Create payment request via API
            const response = await paymentsApi.createRequest({
                indexId: indexData?._id,
                amount,
                duration,
                paymentMethod,
            });

            if (response && response._id) {
                setPaymentRequestId(response._id);
                toast.success("Investment request submitted successfully!");
                nextStep();
            } else {
                throw new Error("Failed to create payment request");
            }
        } catch (error) {
            console.error("Payment request error:", error);
            setPaymentError(error.message || "Failed to submit investment request");
            toast.error(error.message || "Failed to submit investment request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadReceipt = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("SMC Investment Receipt", 20, 20);
        doc.setFontSize(12);
        doc.text(`Request ID: #PAY-123456`, 20, 40);
        doc.text(`Index: ${indexData?.name || "Tech Growth Index"}`, 20, 50);
        doc.text(`Amount: USD ${amount.toLocaleString()}`, 20, 60);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
        doc.text(`Status: Pending Verification`, 20, 80);
        doc.save("SMC-Receipt.pdf");
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setUploadProof(file);

        // If we have a payment request ID, upload the proof immediately
        if (paymentRequestId && file) {
            try {
                const formData = new FormData();
                formData.append('paymentProof', file);
                formData.append('paymentRequestId', paymentRequestId);

                await paymentsApi.uploadProof(formData);
                toast.success("Payment proof uploaded successfully!");
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload proof, please try again");
            }
        } else {
            toast.success("Payment proof ready to upload!");
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [], 'application/pdf': [] },
        multiple: false
    });

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl">
                <DialogHeader className="p-8 pb-0 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                    <div className="flex justify-between items-center mb-2">
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                            Complete Investment
                        </DialogTitle>
                    </div>
                    <StepTracker currentStep={step} />
                </DialogHeader>

                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <Wallet className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                            How much would you like to invest?
                                        </h3>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Minimum investment: ${indexData?.minInvestment?.toLocaleString() || "100"}</p>
                                    </div>
                                </div>

                                {/* Index Info Banner */}
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{indexData?.name || "Tech Growth Index"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Technology Sector</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black px-3 py-1">
                                        4.5% / week
                                    </Badge>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        {/* Quick Select Buttons */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[indexData?.minInvestment || 100, 1000, 5000, 10000, 25000, "custom"].map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => typeof val === 'number' && setAmount(val)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border transition-all text-center",
                                                        amount === val || (val === "custom" && ![indexData?.minInvestment || 100, 1000, 5000, 10000, 25000].includes(amount))
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-blue-500/50"
                                                    )}
                                                >
                                                    <p className="text-sm font-black whitespace-nowrap">
                                                        {val === "custom" ? "Custom" : val < 1000 ? `$${val}` : `$${(val / 1000).toFixed(0)}K`}
                                                    </p>
                                                    {typeof val === 'number' && (
                                                        <p className={cn(
                                                            "text-[8px] font-bold uppercase tracking-widest mt-1",
                                                            amount === val ? "text-blue-100" : "text-slate-400"
                                                        )}>
                                                            ${Math.round(val * 0.045)}/wk
                                                        </p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Input */}
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">$</span>
                                                <Input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(Number(e.target.value))}
                                                    className="h-16 pl-10 text-2xl font-black rounded-2xl border-slate-200 focus:border-blue-500"
                                                    placeholder="Enter amount"
                                                />
                                            </div>
                                            {amount < (indexData?.minInvestment || 100) && <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Minimum ${indexData?.minInvestment?.toLocaleString() || "100"} required</p>}
                                            {amount > 1000000 && <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Maximum $1M per transaction</p>}

                                            <div className="pt-4">
                                                <Slider
                                                    value={[amount]}
                                                    onValueChange={(v) => setAmount(v[0])}
                                                    max={100000}
                                                    min={indexData?.minInvestment || 100}
                                                    step={1000}
                                                />
                                                <div className="flex justify-between mt-3 px-1">
                                                    {["Min", "25K", "50K", "100K"].map(mark => (
                                                        <span key={mark} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mark}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Investment Duration</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { id: "flexible", label: "Flexible (Withdraw Anytime)" },
                                                    { id: "3m", label: "Fixed 3 Months (+0.2% Bonus)" },
                                                    { id: "6m", label: "Fixed 6 Months (+0.5% Bonus)" }
                                                ].map(d => (
                                                    <button
                                                        key={d.id}
                                                        onClick={() => setDuration(d.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-4 rounded-xl border text-sm font-bold transition-all",
                                                            duration === d.id ? "bg-blue-50 dark:bg-blue-500/10 border-blue-600 text-blue-600" : "border-slate-100 dark:border-white/5 text-slate-500"
                                                        )}
                                                    >
                                                        <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", duration === d.id ? "border-blue-600" : "border-slate-300")}>
                                                            {duration === d.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                                        </div>
                                                        {d.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
                                            <h4 className="text-xs font-black opacity-60 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Estimated Earnings</h4>
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Your Investment</p>
                                                        <p className="text-2xl font-black">${amount.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Weekly Return</p>
                                                        <p className="text-2xl font-black text-emerald-400">${weeklyReturn.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="h-[1px] bg-white/10"></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Monthly (4w)</p>
                                                        <p className="text-lg font-black">${monthlyReturn.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">3 Months (12w)</p>
                                                        <p className="text-lg font-black">${threeMonthReturn.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[8px] font-medium opacity-40 uppercase tracking-widest mt-8">* Based on current 4.5% weekly return</p>
                                        </div>

                                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
                                            <Info className="w-5 h-5 text-amber-500 mt-0.5" />
                                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                                                You can increase your investment at any time. Withdrawals are processed within 24-48 hours.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                            Review Your Investment
                                        </h3>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Please verify all details before proceeding</p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-blue-500/5 space-y-6">
                                            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Index Information</h4>
                                                <Badge className="bg-blue-600 text-white border-none font-black px-3 py-1 text-[10px]">Verified Index</Badge>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Name</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{indexData?.name || "Tech Growth Index"}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Risk Level</span>
                                                    <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5 font-black">Medium Risk</Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Weekly Return</span>
                                                    <span className="text-sm font-black text-emerald-500">4.5% (Approx)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-blue-500/5 space-y-6">
                                            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Investment</h4>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Principal Amount</span>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">${amount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Est. Weekly Payout</span>
                                                    <span className="text-sm font-black text-emerald-500">${weeklyReturn.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Type</span>
                                                    <span className="text-sm font-black text-blue-600 uppercase tracking-widest">{duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-blue-600/5 border border-blue-600/10 rounded-3xl p-6 space-y-6">
                                            <div className="flex items-center justify-between border-b border-blue-600/10 pb-4">
                                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Important Dates</h4>
                                            </div>
                                            <div className="space-y-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                    <span>Investment Date: <span className="text-blue-600">Today, Feb 5, 2024</span></span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-blue-600" />
                                                    <span>First Return: <span className="text-blue-600">Friday, Feb 9, 2024</span></span>
                                                </div>
                                                <div className="flex items-center gap-3 pl-7 text-[10px] text-slate-400 uppercase tracking-widest">
                                                    Returns are credited every Friday by 6PM IST
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 px-2">
                                            {[
                                                { id: "varies", label: "I understand that returns vary between 2-5% weekly" },
                                                { id: "terms", label: "I have read and agree to the Terms & Conditions" },
                                                { id: "ownFunds", label: "I confirm this investment is made with my own funds" },
                                                { id: "risk", label: "I understand the risk disclosure" }
                                            ].map(item => (
                                                <div key={item.id} className="flex items-start gap-3 group cursor-pointer" onClick={() => setAcceptedTerms(prev => ({ ...prev, [item.id]: !prev[item.id] }))}>
                                                    <Checkbox checked={acceptedTerms[item.id]} className="mt-0.5" />
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-4">
                                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-tight">
                                                Payment активация occurs after admin verification. Slot reserved for 24 hours.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                            Complete Payment Offline
                                        </h3>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Payment Request ID: #PAY-12345</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Investment request submitted successfully! Your request is being processed.</p>
                                </div>

                                <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                                    <TabsList className="grid grid-cols-3 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl p-1 mb-8">
                                        <TabsTrigger value="bank" className="rounded-xl font-black text-xs uppercase tracking-widest">Bank Transfer</TabsTrigger>
                                        <TabsTrigger value="upi" className="rounded-xl font-black text-xs uppercase tracking-widest">UPI Payment</TabsTrigger>
                                        <TabsTrigger value="support" className="rounded-xl font-black text-xs uppercase tracking-widest">Other Methods</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="bank" className="space-y-8 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-blue-500/5 space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Beneficiary Bank Account</h4>
                                                <div className="space-y-5">
                                                    {[
                                                        { label: "Account Holder", value: "SMC Protocol" },
                                                        { label: "Bank Name", value: "HDFC Bank", copy: false },
                                                        { label: "Account Number", value: "1234567890", copy: true },
                                                        { label: "IFSC Code", value: "HDFC0001234", copy: true },
                                                        { label: "Account Type", value: "Current Account" },
                                                    ].map(item => (
                                                        <div key={item.label} className="flex justify-between items-center group">
                                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.value}</span>
                                                                {item.copy && (
                                                                    <button onClick={() => { navigator.clipboard.writeText(item.value); toast.success(`Copied ${item.label}`); }} className="text-blue-600 hover:scale-110 transition-transform">
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/30">
                                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Total Amount to pay</p>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-4xl font-black">${amount.toLocaleString()}</p>
                                                        <button onClick={() => { navigator.clipboard.writeText(amount.toString()); toast.success("Amount copied"); }} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                                                            <Copy className="w-5 h-5 text-white" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-[0.2em] mt-8">Transfer exact amount for faster verification</p>
                                                </div>

                                                <div className="bg-blue-500/5 border border-blue-600/10 rounded-3xl p-6">
                                                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Instructions</h5>
                                                    <ol className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        <li className="flex gap-2"><span>1.</span> Load funds via IMPS/NEFT/RTGS</li>
                                                        <li className="flex gap-2"><span>2.</span> Add Payment ID <b>#PAY-12345</b> as remark</li>
                                                        <li className="flex gap-2"><span>3.</span> Upload payment proof below</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="upi" className="space-y-8 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-8 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center text-center">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Scan to Pay</h4>
                                                <div className="p-4 bg-white rounded-3xl border-2 border-slate-50 shadow-sm mb-6">
                                                    <QRCodeSVG value={`upi://pay?pa=smc@upi&am=${amount}&tn=PAY-12345`} size={160} />
                                                </div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2 font-mono">smc@upi</p>
                                                <button onClick={() => { navigator.clipboard.writeText("smc@upi"); toast.success("UPI ID copied"); }} className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest">
                                                    <Copy className="w-4 h-4" />
                                                    Copy UPI ID
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/30">
                                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Total Amount to pay</p>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-4xl font-black">${amount.toLocaleString()}</p>
                                                        <button onClick={() => { navigator.clipboard.writeText(amount.toString()); toast.success("Amount copied"); }} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                                                            <Copy className="w-5 h-5 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-500/5 border border-blue-600/10 rounded-3xl p-6 h-full">
                                                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Steps</h5>
                                                    <ol className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        <li>2. Scan QR with any UPI app (GPay, PhonePe, etc.)</li>
                                                        <li>2. Ensure amount is exactly ${amount.toLocaleString()}</li>
                                                        <li>3. Add remark: #PAY-12345</li>
                                                        <li>4. Confirm payment & upload screenshot below</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="support" className="animate-in fade-in duration-300">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-8 flex flex-col items-center text-center">
                                                <Building2 className="w-10 h-10 text-blue-600 mb-6" />
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 underline underline-offset-4 decoration-blue-600/30">Cash/Cheque Deposit</h4>
                                                <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">For large volume investments via physical channels, please visit our corporate branch.</p>
                                                <Button variant="outline" className="rounded-full w-full border-blue-600/20 font-black uppercase text-[10px] tracking-widest">Contact Branch</Button>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-8 flex flex-col items-center text-center">
                                                <MessageSquare className="w-10 h-10 text-blue-600 mb-6" />
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 underline underline-offset-4 decoration-blue-600/30">Direct Priority Support</h4>
                                                <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">Our relationship managers are available 24/7 to assist with your payment flow.</p>
                                                <Button className="rounded-full w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest">Chat with Us</Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Proof Upload Area */}
                                <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Upload Payment Proof (Recommended)</h4>
                                    <div {...getRootProps()} className={cn(
                                        "p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                                        isDragActive ? "border-blue-600 bg-blue-500/5 translate-y-1" : "border-slate-200 dark:border-white/10 hover:border-blue-500/30"
                                    )}>
                                        <input {...getInputProps()} />
                                        <ArrowDownCircle className={cn("w-10 h-10 mb-4 transition-colors", isDragActive ? "text-blue-600" : "text-slate-300")} />
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{uploadProof ? uploadProof.name : "Click to upload or drag & drop"}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">PNG, JPG or PDF up to 5MB</p>
                                    </div>
                                    {uploadProof && (
                                        <div className="flex items-center justify-between p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <BadgeCheck className="w-5 h-5 text-blue-600" />
                                                <span className="text-xs font-bold text-blue-600">{uploadProof.name} ({(uploadProof.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setUploadProof(null); }} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Remove</button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="flex flex-col items-center text-center space-y-8 py-12"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center relative z-10 animate-in zoom-in duration-500">
                                        <CheckCircle2 className="w-14 h-14" />
                                    </div>
                                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping z-0 scale-150 blur-xl"></div>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                                        Request Submitted! 🎉
                                    </h3>
                                    <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">Thank you for investing with us</p>
                                </div>

                                <div className="w-full max-w-lg space-y-6">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/5 space-y-8 text-left">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-4">Confirmation Details</h4>
                                            <div className="space-y-5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Request ID</span>
                                                    <span className="text-sm font-black text-blue-600 uppercase tracking-widest underline underline-offset-4 decoration-blue-500/30">#PAY-123456</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Index</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{indexData?.name || "Tech Growth Index"}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Amount</span>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">${amount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-500">Status</span>
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-none font-black px-4 py-1.5 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                                        Pending Verification
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">What Happens Next?</h4>
                                            <div className="space-y-8 relative">
                                                <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-white/5"></div>
                                                {[
                                                    { step: 1, title: "Payment Verification", status: "In Progress", duration: "2-4 hours", icon: Clock, color: "text-amber-500" },
                                                    { step: 2, title: "Investment Activation", status: "Pending", duration: "Post verification", icon: CheckCircle2, color: "text-slate-300" },
                                                    { step: 3, title: "First Returns", status: "Scheduled", duration: "Next Friday", icon: TrendingUp, color: "text-slate-300" }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex gap-6 relative z-10 items-start">
                                                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10", idx === 0 ? "border-amber-500" : "")}>
                                                            <item.icon className={cn("w-3 h-3", item.color)} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{item.title}</p>
                                                            <div className="flex items-center gap-2 uppercase tracking-widest">
                                                                <span className={cn("text-[8px] font-black", item.color)}>{item.status}</span>
                                                                <span className="text-[10px] text-slate-300">•</span>
                                                                <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">{item.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button className="rounded-2xl h-14 font-black flex items-center gap-2 shadow-xl shadow-blue-500/20" asChild>
                                            <a href="/dashboard/investments">Track Status</a>
                                        </Button>
                                        <Button variant="outline" onClick={downloadReceipt} className="rounded-2xl h-14 font-black border-slate-200 dark:border-white/10 flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            Receipt
                                        </Button>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                                        <div className="flex items-center justify-center gap-6">
                                            {[
                                                { checked: true, label: "Verification alert" },
                                                { checked: true, label: "Weekly returns" },
                                                { checked: false, label: "Market updates" }
                                            ].map((pref, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Checkbox checked={pref.checked} />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{pref.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                    <div className="w-full flex flex-col sm:flex-row gap-4">
                        {step > 1 && step < 4 && (
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                className="rounded-2xl h-14 px-8 font-black border-slate-200 dark:border-white/10 flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button
                                onClick={nextStep}
                                disabled={step === 1 && (amount < (indexData?.minInvestment || 100) || amount > 1000000)}
                                className="flex-1 rounded-2xl h-14 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 text-lg uppercase tracking-widest"
                            >
                                {step === 1 ? `Choose $${amount.toLocaleString()}` : "Accept & Proceed"}
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        ) : step === 3 ? (
                            <Button
                                onClick={handleInvest}
                                disabled={isSubmitting}
                                className="flex-1 rounded-2xl h-14 font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 text-lg uppercase tracking-widest"
                            >
                                {isSubmitting ? "Processing Request..." : "I've Made the Payment"}
                                {!isSubmitting && <CheckCircle2 className="ml-2 w-5 h-5" />}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleClose}
                                className="flex-1 rounded-2xl h-14 font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl text-lg uppercase tracking-widest"
                            >
                                Done
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InvestmentModal;
