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
    Calendar,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { useDropzone } from "react-dropzone";

import { usePaymentRequests } from "@/hooks/useApi";

const QRCodeSVG = dynamic(() => import("qrcode.react").then(mod => mod.QRCodeSVG), { ssr: false });

const StepTracker = ({ currentStep, steps }) => {
    // ... existing StepTracker code ...
};

const InvestmentFlow = ({ indexData }) => {
    // ... existing state ...
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(25000);
    const [duration, setDuration] = useState("flexible");
    const [acceptedTerms, setAcceptedTerms] = useState({
        varies: false,
        terms: false,
        ownFunds: false,
        risk: false,
    });
    const [paymentMethod, setPaymentMethod] = useState("bep20_usdt");
    const [uploadProof, setUploadProof] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionHash, setTransactionHash] = useState("");
    const [paymentRequestData, setPaymentRequestData] = useState(null);

    const { createRequest, uploadProof: uploadProofApi } = usePaymentRequests();

    const steps = [
        { id: 1, label: "Amount" },
        { id: 2, label: "Review" },
        { id: 3, label: "Payment" },
        { id: 4, label: "Done" },
    ];

    const currentRate = 0.045; // 4.5%
    const weeklyReturn = Math.round(amount * currentRate);
    const totalROI = duration === "flexible" ? "Variable" : duration === "3m" ? "58% (Est)" : "125% (Est)";

    const nextStep = () => {
        setStep(s => Math.min(s + 1, 4));
        window.scrollTo({ top: 0, behavior: "auto" });
    };

    const prevStep = () => {
        setStep(s => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: "auto" });
    };

    const handleCreateRequest = async () => {
        setIsSubmitting(true);
        try {
            const requestData = {
                amount: Number(amount),
                indexId: indexData?._id || indexData?.id,
                paymentMethod: paymentMethod,
                duration: duration
            };

            // Call API to create payment request
            const response = await createRequest(requestData);

            if (response && response.paymentDetails) {
                setPaymentRequestData(response);
                toast.success("Payment request created! Please complete the transfer.");
            } else {
                // Handle error or duplicate pending request
                toast.error(response?.message || "Failed to create request. Check if you have pending requests.");
            }
        } catch (error) {
            console.error("Create request error:", error);
            toast.error(error.message || "Failed to create payment request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!uploadProof || !transactionHash || !paymentRequestData) {
            toast.error("Please provide transaction hash and upload proof");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('paymentRequestId', paymentRequestData.id); // API returns 'id'
            formData.append('transactionReference', transactionHash);
            formData.append('proofDocument', uploadProof);

            await uploadProofApi(formData);

            toast.success("Payment proof uploaded successfully!");
            nextStep();
        } catch (error) {
            console.error("Upload proof error:", error);
            toast.error(error.message || "Failed to upload proof");
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadReceipt = async () => {
        try {
            const jsPDF = (await import("jspdf")).default;
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text("SMC Investment Receipt", 20, 20);
            doc.setFontSize(12);
            doc.text(`Request ID: ${paymentRequestData?.requestId || "#PENDING"}`, 20, 40);
            doc.text(`Index: ${indexData?.name || "Tech Growth Index"}`, 20, 50);
            doc.text(`Amount: USD ${amount.toLocaleString()}`, 20, 60);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
            doc.text(`Status: Pending Verification`, 20, 80);
            doc.save("SMC-Receipt.pdf");
        } catch (e) {
            console.error("PDF generation failed", e);
            toast.error("Failed to generate receipt");
        }
    };

    const onDrop = (acceptedFiles) => {
        setUploadProof(acceptedFiles[0]);
        toast.success("Payment proof uploaded!");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [], 'application/pdf': [] },
        multiple: false
    });
    return (
        <Card className="rounded-xl border-slate-100 dark:border-white/5 shadow-xl shadow-blue-500/5 overflow-hidden border-none gap-0 py-0">
            <CardHeader className="p-6 pb-0 border-b-0 space-y-0">
                <StepTracker currentStep={step} steps={steps} />
            </CardHeader>

            <CardContent className="p-6">
                <AnimatePresence>
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Amount Input Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Investment Amount</h3>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">$</span>
                                            <Input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                className="h-14 pl-10 text-2xl font-bold bg-slate-50 dark:bg-white/5 border-transparent focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                {[10000, 25000, 50000].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setAmount(val)}
                                                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                                                    >
                                                        {val < 1000 ? `$${val}` : `${(val / 1000)}k`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <Slider
                                            value={[amount]}
                                            onValueChange={(v) => setAmount(v[0])}
                                            max={500000}
                                            min={indexData?.minInvestment || 100}
                                            step={5000}
                                            className="py-2"
                                        />
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            <span>Min: ${indexData?.minInvestment?.toLocaleString() || "100"}</span>
                                            <span>Max: $1M</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Weekly Payout</p>
                                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${weeklyReturn.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Est. Total ROI</p>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalROI}</p>
                                    </div>
                                </div>

                                {/* Lock-in Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Duration Plan</h3>
                                    <div className="grid sm:grid-cols-3 gap-3">
                                        {[
                                            { id: "flexible", label: "Flexible", sub: "Withdraw Anytime" },
                                            { id: "3m", label: "3 Months", sub: "Priority (+0.2%)" },
                                            { id: "6m", label: "6 Months", sub: "Protected (+0.5%)" }
                                        ].map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => setDuration(d.id)}
                                                className={cn(
                                                    "p-3 rounded-xl border text-left transition-all",
                                                    duration === d.id
                                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg"
                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-slate-300"
                                                )}
                                            >
                                                <p className={cn("text-sm font-bold", duration === d.id ? "text-white dark:text-slate-900" : "text-slate-700 dark:text-slate-300")}>{d.label}</p>
                                                <p className={cn("text-[10px] uppercase tracking-wide mt-1", duration === d.id ? "text-slate-400 dark:text-slate-500" : "text-slate-400")}>{d.sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
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
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-white/2 rounded-xl p-6 border border-slate-100 dark:border-white/5">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200/50 dark:border-white/5">Investment Summary</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</span>
                                                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">${amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Return</span>
                                                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    4.5% Weekly
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Limit</span>
                                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{duration}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-white/2 rounded-xl p-6 border border-slate-100 dark:border-white/5">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200/50 dark:border-white/5">Payout Schedule</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">Active from: Today</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Initial Processing</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">First Return: Next Friday</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${weeklyReturn.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 py-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Confirm Agreements</h4>
                                    <div className="space-y-4">
                                        {[
                                            { id: "varies", label: "I understand that returns vary between 2-5% weekly" },
                                            { id: "terms", label: "I have read and agree to the Investment Terms & Conditions" },
                                            { id: "ownFunds", label: "This investment is made with my own legitimate funds" },
                                            { id: "risk", label: "I acknowledge the risks associated with index investing" }
                                        ].map(item => (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                                                    acceptedTerms[item.id] ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20" : "border-slate-100 dark:border-white/5"
                                                )}
                                                onClick={() => setAcceptedTerms(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                            >
                                                <Checkbox checked={acceptedTerms[item.id]} className="mt-0.5" />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-tight transition-colors",
                                                    acceptedTerms[item.id] ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest leading-relaxed">
                                            Funds will be locked for the chosen duration. Early withdrawal may incur a 2% processing fee.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {!paymentRequestData ? (
                                /* Phase 1: Select Network & Generate Address */
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
                                                    "relative cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                                                    paymentMethod === net.id
                                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-slate-100 dark:border-white/5 hover:border-blue-200"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="outline" className={cn(
                                                        "font-bold",
                                                        paymentMethod === net.id ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {net.network}
                                                    </Badge>
                                                    {paymentMethod === net.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                                </div>
                                                <p className="font-bold text-slate-900 dark:text-white">{net.label}</p>
                                                <p className="text-xs text-slate-500 mt-1">Provider Fee: {net.fee}</p>
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

                                    <Button
                                        onClick={handleCreateRequest}
                                        disabled={isSubmitting}
                                        className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Generating Address...
                                            </>
                                        ) : (
                                            "Generate Payment Address"
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                /* Phase 2: Show Address & Upload Proof */
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Payment Details Card */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center gap-6">
                                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                <QRCodeSVG
                                                    value={paymentRequestData.paymentDetails.walletAddress}
                                                    size={160}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-4 w-full text-center md:text-left">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Send Exact Amount</p>
                                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                                            ${paymentRequestData.paymentDetails.amount.toLocaleString()}
                                                            <span className="text-sm font-bold text-slate-400 ml-1">USDT</span>
                                                        </h3>
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(paymentRequestData.paymentDetails.amount.toString()); toast.success("Amount copied"); }}
                                                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wallet Address ({paymentRequestData.paymentDetails.network})</p>
                                                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 group hover:border-blue-400 transition-colors">
                                                        <code className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all flex-1">
                                                            {paymentRequestData.paymentDetails.walletAddress}
                                                        </code>
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(paymentRequestData.paymentDetails.walletAddress); toast.success("Address copied"); }}
                                                            className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 flex items-start gap-3">
                                            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                                                Please send only <strong>USDT ({paymentRequestData.paymentDetails.network})</strong> to this address. Sending any other asset may result in permanent loss.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Proof Submission */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submit Proof</span>
                                            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Transaction Hash / ID</label>
                                                <Input
                                                    placeholder="Paste your transaction hash here (e.g. 0x...)"
                                                    value={transactionHash}
                                                    onChange={(e) => setTransactionHash(e.target.value)}
                                                    className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-blue-500 font-mono text-xs"
                                                />
                                            </div>

                                            <div {...getRootProps()} className={cn(
                                                "p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                                                isDragActive ? "border-blue-600 bg-blue-500/5 translate-y-1" : "border-slate-200 dark:border-white/10 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                            )}>
                                                <input {...getInputProps()} />
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <ArrowDownCircle className={cn("w-6 h-6", isDragActive ? "text-blue-600" : "text-slate-400")} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                    {uploadProof ? uploadProof.name : "Click to Upload Screenshot"}
                                                </p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                                    {uploadProof ? "File selected" : "JPG, PNG, PDF (Max 5MB)"}
                                                </p>
                                            </div>

                                            {uploadProof && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center justify-between p-3 px-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[200px]">{uploadProof.name}</span>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); setUploadProof(null); }} className="text-emerald-600 hover:text-emerald-800 p-1">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center py-8"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Request Received</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Ref: {paymentRequestData?.requestId}</p>

                            <div className="w-full max-w-lg bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden mb-8">
                                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black text-slate-900 dark:text-white">${amount.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Investment Value</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[9px] px-3 py-1">Reviewing</Badge>
                                </div>
                                <div className="p-5 grid sm:grid-cols-3 gap-6 text-left">
                                    {[
                                        { icon: FileText, title: "Verifying", sub: "~2 Hours" },
                                        { icon: BadgeCheck, title: "Activation", sub: "Today" },
                                        { icon: Wallet, title: "First Payout", sub: "Next Fri" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <item.icon className={cn("w-4 h-4", i === 0 ? "text-blue-600" : "text-slate-300")} />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{item.title}</p>
                                                <p className="text-[9px] font-semibold text-slate-400">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                                <Button asChild className="flex-1 rounded-xl h-11 font-black bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white shadow-lg text-[10px] uppercase tracking-widest">
                                    <a href="/dashboard/investments">Track Status</a>
                                </Button>
                                <Button variant="outline" onClick={downloadReceipt} className="flex-1 rounded-xl h-11 font-black border-slate-200 dark:border-white/10 text-[10px] uppercase tracking-widest">
                                    <Download className="w-3.5 h-3.5 mr-2" />
                                    Save Receipt
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>

            <CardFooter className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-white/1">
                <div className="flex flex-col sm:flex-row justify-end gap-4 w-full">
                    {step > 1 && step < 4 && (
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="w-full sm:w-auto px-8 rounded-xl h-12 font-black border-slate-200 dark:border-white/10 text-xs uppercase tracking-widest group"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button
                            onClick={nextStep}
                            disabled={step === 1 && (amount < (indexData?.minInvestment || 100) || amount > 1000000)}
                            className="w-full sm:w-auto px-8 rounded-xl h-12 font-black bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg transition-all text-sm uppercase tracking-widest group"
                        >
                            {step === 1 ? `Proceed with $${amount.toLocaleString()}` : "Accept & Continue"}
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : step === 3 ? (
                        !paymentRequestData ? null : (
                            <Button
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting || !uploadProof || !transactionHash}
                                className="w-full sm:w-auto px-8 rounded-xl h-12 font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest group disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Confirm Payment"}
                                {!isSubmitting && <CheckCircle2 className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />}
                            </Button>
                        )
                    ) : (
                        <Button
                            onClick={() => setStep(1)}
                            className="w-full sm:w-auto px-8 rounded-xl h-12 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all text-sm uppercase tracking-widest"
                        >
                            Make Another Investment
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card >
    );
};

export default InvestmentFlow;
