"use client";

import * as React from "react";
import { useState } from "react";
import {
    Search,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Download,
    Check,
    X,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Wallet,
    DollarSign,
    ArrowUpRight,
    Receipt,
    ExternalLink,
    AlertCircle,
    Banknote,
    User,
} from "lucide-react";

import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { useAdminPayments } from "@/hooks/useApi";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const StatusBadge = React.memo(function StatusBadge({ status }) {
    if (status === "approved" || status === "verified") {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium py-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Verified
            </Badge>
        );
    }
    if (status === "rejected" || status === "failed") {
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-medium py-0.5">
                <XCircle className="w-3 h-3" />
                Rejected
            </Badge>
        );
    }
    if (status === "pending" || status === "initialized") {
        return (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-medium py-0.5">
                <Clock className="w-3 h-3" />
                Awaiting User
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-medium py-0.5">
            <Clock className="w-3 h-3" />
            {status === "proof_uploaded" ? "Processing" : "Expired"}
        </Badge>
    );
});

export default function PaymentManagementPage() {
    const queryClient = useQueryClient();
    // 1. FILTER & SEARCH STATE
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    // 2. DATA FETCHING (REACT QUERY)
    // Caches the list of payments and automatically re-fetches when dependencies change.
    const { payments, pagination, loading, error, refetch } = useAdminPayments({
        page: currentPage,
        limit: perPage,
        search: searchQuery
    });

    // 3. UI INTERACTION STATE
    // Manages the sliding drawer (Sheet) and the loading state of specific action buttons
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // ID of the payment being processed
    const [mounted, setMounted] = useState(false);

    // 4. LIFECYCLE
    // Prevents hydration errors by ensuring component renders on client side first
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const stats = React.useMemo(() => [
        { title: "Pending Request", value: pagination?.total || 0, icon: Clock, color: "text-white", bg: "bg-blue-600" },
        { title: "Verified Total", value: pagination?.verifiedTotal || 0, icon: CheckCircle, color: "text-white", bg: "bg-green-600" },
        { title: "Total Deposit", value: pagination?.totalAmount ? `$${pagination.totalAmount.toLocaleString()}` : "$0", icon: Wallet, color: "text-white", bg: "bg-purple-600" },
        { title: "Failed/Rejected", value: pagination?.rejectedTotal || 0, icon: XCircle, color: "text-white", bg: "bg-red-600" },
    ], [pagination]);

    const handleViewDetails = React.useCallback((payment) => {
        setSelectedPayment(payment);
        setIsSheetOpen(true);
    }, []);

    const handleAction = React.useCallback(async (id, status) => {
        setActionLoading(id);
        try {
            if (status === 'approved') {
                await adminApi.approvePayment(id);
                toast.success("Payment approved successfully");
            } else {
                await adminApi.rejectPayment(id, "Rejected by admin");
                toast.success("Payment rejected");
            }

            // Refetch without showing the global loading spinner if possible, 
            // but for now we'll just wait for the refetch to complete.
            await refetch();
            
            // Force instant sidebar badge update
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });

            if (selectedPayment?._id === id || selectedPayment?.id === id) {
                setIsSheetOpen(false);
            }
        } catch (err) {
            console.error("Action error:", err);
            toast.error(err.message || "Action failed");
        } finally {
            setActionLoading(null);
        }
    }, [selectedPayment, queryClient, refetch]);

    return (
        <div className="space-y-6">
            {!mounted || (loading && !payments) ? (
                <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payment Requests</h1>
                            <p className="text-sm text-gray-500 mt-1">Review and verify manual payment submissions.</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-9">
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <Card key={stat.title} className="border-none shadow-sm py-1">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">{stat.title}</p>
                                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Main Content */}
                    <Card className="border-none shadow-sm overflow-hidden py-2">
                        <CardHeader className="bg-white px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
                            <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                Transaction Verifications
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full sm:w-60">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <Input
                                        placeholder="Search by User or Ref ID..."
                                        className="pl-9 h-9 text-xs border-gray-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="h-9 border-gray-200 text-xs text-slate-600">
                                    <Filter className="w-3.5 h-3.5 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </CardHeader>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase px-6">User</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Amount</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Method</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Reference ID</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Status</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Date</TableHead>
                                        <TableHead className="text-right px-6 text-xs font-bold text-gray-500 uppercase">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments?.map((req) => (
                                        <TableRow key={req.id || req._id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="px-6">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">{req.user?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-gray-400 truncate font-mono">{req.requestId || req._id}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-blue-600">${req.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-[11px] font-medium text-gray-700 capitalize">{req.paymentMethod?.replace('_', ' ') || '—'}</TableCell>
                                            <TableCell className="text-[10px] font-mono text-gray-500 max-w-[120px] truncate">{req.transactionReference || '—'}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={req.status} />
                                            </TableCell>
                                            <TableCell className="text-[10px] text-gray-500 font-medium">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-indigo-600 hover:bg-indigo-50"
                                                                    onClick={() => handleViewDetails(req)}
                                                                >
                                                                    <Receipt className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px]">View Proof</TooltipContent>
                                                        </Tooltip>
                                                        {(req.status === "pending" || req.status === "proof_uploaded") && (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-green-600 hover:bg-green-50"
                                                                            disabled={actionLoading === (req.id || req._id)}
                                                                            onClick={() => handleAction(req.id || req._id, 'approved')}
                                                                        >
                                                                            {actionLoading === (req.id || req._id) ? (
                                                                                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                                            ) : (
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            )}
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="text-[10px]">Verify Payment</TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-red-600 hover:bg-red-50"
                                                                            onClick={() => handleAction(req.id || req._id, 'rejected')}
                                                                        >
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="text-[10px]">Reject</TooltipContent>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {payments?.map((req) => (
                                <div key={req.id || req._id} className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{req.user?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{req.requestId || req._id}</p>
                                        </div>
                                        <p className="text-sm font-bold text-blue-600">${req.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                                        <div>
                                            <p className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">Method</p>
                                            <p className="font-semibold text-gray-700 capitalize">{req.paymentMethod?.replace('_', ' ') || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">Ref ID</p>
                                            <p className="font-mono text-gray-500 truncate">{req.transactionReference || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <StatusBadge status={req.status} />
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold" onClick={() => handleViewDetails(req)}>
                                                <Receipt className="w-3 h-3 mr-1" />
                                                Proof
                                            </Button>
                                            {(req.status === "pending" || req.status === "proof_uploaded") && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold bg-green-600"
                                                    disabled={actionLoading === (req.id || req._id)}
                                                    onClick={() => handleAction(req.id || req._id, 'approved')}
                                                >
                                                    {actionLoading === (req.id || req._id) ? (
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                                    ) : "Verify"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <CardFooter className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[11px] text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-bold">{payments?.length || 0}</span> of {pagination?.total || 0} requests
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 text-[11px] font-bold"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 text-[11px] font-bold"
                                    disabled={currentPage === pagination?.pages}
                                    onClick={() => setCurrentPage(prev => Math.min(pagination?.pages || 1, prev + 1))}
                                >
                                    Next
                                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </>
            )}

            {/* Payment Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="p-0 sm:max-w-xl overflow-y-auto">
                    {selectedPayment && (
                        <div className="flex flex-col h-full bg-gray-50/30">
                            <SheetHeader className="p-6 border-b bg-white shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <SheetTitle className="text-xl font-black text-gray-900">${selectedPayment.amount.toLocaleString()}</SheetTitle>
                                            <p className="text-[10px] text-gray-400 font-mono tracking-widest">{selectedPayment.requestId || selectedPayment._id}</p>
                                            <div className="mt-2">
                                                <StatusBadge status={selectedPayment.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="p-6 space-y-6">
                                {/* Transaction Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Method</p>
                                        <p className="text-sm font-bold text-gray-900 capitalize">{selectedPayment.paymentMethod?.replace('_', ' ') || '—'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Time</p>
                                        <p className="text-sm font-bold text-gray-900">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* User Details */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        User Information
                                    </h3>
                                    <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                            {selectedPayment.user?.name?.[0] || 'U'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900">{selectedPayment.user?.name || 'Unknown'}</p>
                                            <p className="text-[11px] text-gray-500 truncate">{selectedPayment.user?.email || '—'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="ml-auto text-blue-600">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Banknote className="w-3 h-3" />
                                        Payment Records
                                    </h3>
                                    <Card className="border-none shadow-sm">
                                        <div className="divide-y divide-gray-50">
                                            <div className="flex justify-between p-4">
                                                <span className="text-xs text-gray-500 font-medium">Reference ID</span>
                                                <span className="text-xs font-bold text-gray-900 font-mono tracking-tighter">{selectedPayment.transactionReference || '—'}</span>
                                            </div>
                                            <div className="flex justify-between p-4">
                                                <span className="text-xs text-gray-500 font-medium">Fee (0%)</span>
                                                <span className="text-xs font-bold text-gray-900">$0.00</span>
                                            </div>
                                            <div className="flex justify-between p-4">
                                                <span className="text-xs text-gray-500 font-medium">Wallet Balance After</span>
                                                <span className="text-xs font-bold text-green-600">+ ${selectedPayment.amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Proof Attachment */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Receipt className="w-3 h-3" />
                                        Transaction Proof
                                    </h3>
                                    {selectedPayment.paymentProof ? (
                                        <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 group hover:border-blue-300 transition-colors overflow-hidden">
                                            <img
                                                src={selectedPayment.paymentProof.startsWith('http') ? selectedPayment.paymentProof : `${process.env.NEXT_PUBLIC_APP_URL || ''}${selectedPayment.paymentProof}`}
                                                alt="Proof"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400">
                                            <Receipt className="w-10 h-10 opacity-20" />
                                            <p className="text-xs font-bold">No proof uploaded</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 mt-4">
                                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-blue-900 leading-relaxed font-semibold">
                                            Match the Reference ID with your bank statement before approving.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="mt-auto p-4 border-t bg-white flex gap-3">
                                {(selectedPayment.status === "pending" || selectedPayment.status === "proof_uploaded") ? (
                                    <>
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-xs font-bold h-11 shadow-lg shadow-green-200"
                                            disabled={actionLoading === (selectedPayment._id || selectedPayment.id)}
                                            onClick={() => handleAction(selectedPayment._id || selectedPayment.id, 'approved')}
                                        >
                                            {actionLoading === (selectedPayment._id || selectedPayment.id) ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                            )}
                                            Confirm Payment
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 text-red-600 border-red-100 hover:bg-red-50 text-xs font-bold h-11"
                                            onClick={() => handleAction(selectedPayment._id, 'rejected')}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" className="w-full text-xs font-bold h-11" onClick={() => setIsSheetOpen(false)}>
                                        Close Details
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
