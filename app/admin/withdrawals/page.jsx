"use client";

import * as React from "react";
import { useState } from "react";
import {
    Search,
    Wallet,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Download,
    Eye,
    Check,
    X,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowDownLeft,
    Banknote,
    Building2,
    CreditCard,
    ArrowUpRight,
    History,
    MoreHorizontal,
    ExternalLink,
    AlertCircle,
    Info,
    Smartphone,
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
import { useAdminWithdrawals } from "@/hooks/useApi";
import { toast } from "sonner";

function StatusBadge({ status }) {
    if (status === "completed" || status === "approved") {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium py-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Completed
            </Badge>
        );
    }
    if (status === "rejected") {
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-medium py-0.5">
                <XCircle className="w-3 h-3" />
                Rejected
            </Badge>
        );
    }
    if (status === "processing") {
        return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-medium py-0.5 animate-pulse">
                <Clock className="w-3 h-3" />
                Processing
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-medium py-0.5">
            <Clock className="w-3 h-3" />
            Pending
        </Badge>
    );
}

export default function WithdrawalsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const { withdrawals, pagination, loading, error, refetch } = useAdminWithdrawals({
        page: currentPage,
        limit: perPage,
        search: searchQuery,
        status: statusFilter
    });

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [txnRef, setTxnRef] = useState("");

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const stats = [
        { title: "Pending Payout", value: pagination?.pendingTotal ?? 0, icon: Clock, color: "text-white", bg: "bg-blue-600" },
        { title: "Processed Total", value: pagination?.processedTotal ?? 0, icon: CheckCircle, color: "text-white", bg: "bg-green-600" },
        { title: "Total Withdrawal", value: pagination?.totalAmount ? `$${pagination.totalAmount.toLocaleString()}` : "$0", icon: ArrowDownLeft, color: "text-white", bg: "bg-purple-600" },
        { title: "Rejected", value: pagination?.rejectedTotal ?? 0, icon: XCircle, color: "text-white", bg: "bg-red-600" },
    ];

    const handleViewDetails = (req) => {
        setSelectedRequest(req);
        setTxnRef(req.transactionReference || "");
        setIsSheetOpen(true);
    };

    const handleAction = async (id, status) => {
        try {
            if (status === 'approved') {
                if (!txnRef) {
                    toast.error("Transaction Reference is required for approval");
                    return;
                }
                await adminApi.approveWithdrawal(id, txnRef);
                toast.success("Withdrawal approved and marked as processed");
            } else {
                const reason = prompt("Reason for rejection:");
                if (reason === null) return;
                await adminApi.rejectWithdrawal(id, reason || "Rejected by admin");
                toast.success("Withdrawal rejected");
            }
            refetch();
            if (selectedRequest?._id === id) setIsSheetOpen(false);
        } catch (err) {
            toast.error(err.message || "Action failed");
        }
    };

    return (
        <div className="space-y-6">
            {!mounted || loading ? (
                <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <TooltipProvider>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage and process fund withdrawal requests.</p>
                            </div>
                            <Button
                                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                                size="sm"
                                className="h-9"
                                onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {statusFilter === 'approved' ? 'Showing Payouts' : 'View Payout History'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat) => (
                                <Card key={stat.title} className="border-none shadow-sm py-2">
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

                        <Card className="border-none shadow-sm overflow-hidden py-2">
                            <CardHeader className="bg-white px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
                                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-blue-600" />
                                    {statusFilter === 'all' ? 'All Requests' : statusFilter === 'approved' ? 'Processed Payouts' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Requests`}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-full sm:w-60">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <Input
                                            placeholder="Search user or ID..."
                                            className="pl-9 h-9 text-xs border-gray-200"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" className="h-9 border-gray-200 text-xs text-gray-600">
                                        <Filter className="w-3.5 h-3.5 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </CardHeader>

                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="text-xs font-bold text-gray-500 uppercase px-6">User</TableHead>
                                            <TableHead className="text-xs font-bold text-gray-500 uppercase">Amount</TableHead>
                                            <TableHead className="text-xs font-bold text-gray-500 uppercase">Method</TableHead>
                                            <TableHead className="text-xs font-bold text-gray-500 uppercase">Status</TableHead>
                                            <TableHead className="text-xs font-bold text-gray-500 uppercase">Requested On</TableHead>
                                            <TableHead className="text-right px-6 text-xs font-bold text-gray-500 uppercase">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {withdrawals?.map((req) => (
                                            <TableRow key={req._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <TableCell className="px-6">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{req.user?.name || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-400 truncate font-mono">{req.requestId || req._id}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-bold text-gray-900">${req.amount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {req.method === "bank" ? <Building2 className="w-3 h-3 text-gray-400" /> : <Smartphone className="w-3 h-3 text-blue-500" />}
                                                        <span className="text-[11px] font-medium text-gray-700 capitalize">{req.method || 'crypto'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={req.status} />
                                                </TableCell>
                                                <TableCell className="text-[10px] text-gray-500 font-medium">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                                                                    onClick={() => handleViewDetails(req)}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px]">View Details</TooltipContent>
                                                        </Tooltip>
                                                        {req.status === "pending" && (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:bg-green-50" onClick={() => handleViewDetails(req)}>
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="text-[10px]">Process Payout</TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleAction(req._id, 'rejected')}>
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="text-[10px]">Reject</TooltipContent>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="md:hidden divide-y divide-gray-100">
                                {withdrawals?.map((req) => (
                                    <div key={req._id} className="p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{req.user?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-gray-400 font-mono tracking-tight">{req.requestId || req._id}</p>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">${req.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <div className="flex items-center gap-2">
                                                {req.method === "bank" ? <Building2 className="w-3.5 h-3.5 text-gray-400" /> : <Smartphone className="w-3.5 h-3.5 text-blue-500" />}
                                                <span className="font-semibold text-gray-700 capitalize">{req.method || 'crypto'}</span>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50/50">
                                            <p className="text-[10px] text-gray-400 font-medium">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold" onClick={() => handleViewDetails(req)}>
                                                    Details
                                                </Button>
                                                {req.status === "pending" && (
                                                    <Button variant="default" size="sm" className="h-7 text-[10px] font-bold bg-green-600" onClick={() => handleViewDetails(req)}>
                                                        Approve
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <CardFooter className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-[11px] text-gray-500 font-medium">
                                    Total <span className="text-gray-900 font-bold">{pagination?.total || 0}</span> requests found
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
                    </TooltipProvider>

                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetContent side="right" className="p-0 sm:max-w-xl border-l overflow-y-auto">
                            {selectedRequest && (
                                <div className="flex flex-col h-full bg-slate-50/10">
                                    <SheetHeader className="p-6 border-b bg-white">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
                                                    <ArrowDownLeft className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <SheetTitle className="text-xl font-black text-gray-900">Withdraw ${selectedRequest.amount.toLocaleString()}</SheetTitle>
                                                    <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{selectedRequest.requestId || selectedRequest._id}</p>
                                                    <div className="mt-2">
                                                        <StatusBadge status={selectedRequest.status} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SheetHeader>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:border-blue-100">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Transfer Type</p>
                                                <p className="text-sm font-bold text-gray-900 capitalize">{selectedRequest.method || 'crypto'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:border-blue-100">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Fee (0.5%)</p>
                                                <p className="text-sm font-bold text-red-600">${(selectedRequest.amount * 0.005).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Info className="w-3 h-3" />
                                                User Details
                                            </h3>
                                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                    {selectedRequest.user?.name?.[0] || 'U'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{selectedRequest.user?.name || 'Unknown'}</p>
                                                    <p className="text-[11px] text-gray-500 truncate">{selectedRequest.user?.email || '—'}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-blue-600 h-8 w-8">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Building2 className="w-3 h-3" />
                                                Payout Destination
                                            </h3>
                                            <Card className="border-none shadow-sm bg-white overflow-hidden">
                                                <div className="divide-y divide-gray-50">
                                                    <div className="flex justify-between p-4 bg-slate-50/50">
                                                        <span className="text-xs text-gray-500 font-medium">Preferred Method</span>
                                                        <span className="text-xs font-bold text-gray-900 capitalize">{selectedRequest.method || 'crypto'}</span>
                                                    </div>
                                                    {selectedRequest.method === 'bank' && selectedRequest.bankDetails && (
                                                        <>
                                                            <div className="flex justify-between p-4">
                                                                <span className="text-xs text-gray-500 font-medium">Bank Name</span>
                                                                <span className="text-xs font-bold text-gray-900">{selectedRequest.bankDetails.bankName || '—'}</span>
                                                            </div>
                                                            <div className="flex justify-between p-4">
                                                                <span className="text-xs text-gray-500 font-medium">Account No.</span>
                                                                <span className="text-xs font-bold text-gray-900 font-mono tracking-tighter">{selectedRequest.bankDetails.accountNumber || '—'}</span>
                                                            </div>
                                                            <div className="flex justify-between p-4">
                                                                <span className="text-xs text-gray-500 font-medium">IFSC</span>
                                                                <span className="text-xs font-bold text-gray-900 font-mono">{selectedRequest.bankDetails.ifscCode || '—'}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {(selectedRequest.method === 'crypto' || !selectedRequest.method) && selectedRequest.cryptoDetails && (
                                                        <>
                                                            <div className="flex justify-between p-4">
                                                                <span className="text-xs text-gray-500 font-medium">Network</span>
                                                                <span className="text-xs font-bold text-blue-600">{selectedRequest.cryptoDetails.network || '—'}</span>
                                                            </div>
                                                            <div className="p-4 space-y-2">
                                                                <span className="text-xs text-gray-500 font-medium block">Wallet Address</span>
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 break-all">
                                                                    <span className="text-xs font-mono font-bold text-gray-900">{selectedRequest.cryptoDetails.address || '—'}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>

                                        {selectedRequest.status === "pending" && (
                                            <div className="space-y-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Reference</label>
                                                <Input
                                                    placeholder="Enter Bank/UPI Reference ID..."
                                                    value={txnRef}
                                                    onChange={(e) => setTxnRef(e.target.value)}
                                                    className="h-10 text-xs"
                                                />
                                            </div>
                                        )}

                                        <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex gap-3">
                                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[11px] text-red-900 leading-relaxed font-bold">
                                                    Crucial: Verify withdrawal address matches KYC verified bank details.
                                                </p>
                                                <p className="text-[10px] text-red-700 mt-1">Funds will be debited from user balance.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto p-4 border-t bg-white flex gap-3">
                                        {selectedRequest.status === "pending" ? (
                                            <>
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs font-bold h-11 shadow-lg shadow-green-100"
                                                    onClick={() => handleAction(selectedRequest._id, 'approved')}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Mark as Processed
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-100 hover:bg-red-50 text-xs font-bold h-11"
                                                    onClick={() => handleAction(selectedRequest._id, 'rejected')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject Request
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
                </>
            )}
        </div>
    );
}
