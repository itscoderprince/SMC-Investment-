"use client";

import * as React from "react";
import { useState } from "react";
import {
    Search,
    FileCheck,
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
    Shield,
    User,
    FileText,
    AlertCircle,
    Info,
    ArrowUpRight,
    ExternalLink,
    CreditCard,
    Fingerprint,
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
import { useAdminKYC } from "@/hooks/useApi";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

function StatusBadge({ status }) {
    if (status === "approved" || status === "verified") {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium py-0.5 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3" />
                Approved
            </Badge>
        );
    }
    if (status === "rejected" || status === "failed") {
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-medium py-0.5 whitespace-nowrap">
                <XCircle className="w-3 h-3" />
                Rejected
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-medium py-0.5 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            Pending
        </Badge>
    );
}

export default function KYCManagementPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        status: "all",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const { records: kycRecords, pagination, loading, error, refetch } = useAdminKYC({
        page: currentPage,
        limit: perPage,
        status: filters.status === 'all' ? undefined : filters.status,
        search: searchQuery
    });

    const [selectedKyc, setSelectedKyc] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // ID of the KYC being processed
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const stats = [
        { title: "Total Pending", value: pagination?.pendingTotal || 0, icon: Clock, color: "text-white", bg: "bg-blue-600" },
        { title: "Verified Today", value: pagination?.verifiedTodayTotal || 0, icon: CheckCircle, color: "text-white", bg: "bg-green-600" },
        { title: "Total Requests", value: pagination?.total || 0, icon: Shield, color: "text-white", bg: "bg-purple-600" },
        { title: "Rejections", value: pagination?.rejectedTotal || 0, icon: XCircle, color: "text-white", bg: "bg-red-600" },
    ];

    const handleViewDetails = (kyc) => {
        setSelectedKyc(kyc);
        setIsSheetOpen(true);
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await adminApi.approveKYC(id);
            toast.success("KYC approved successfully");

            // Refetch data
            await refetch();
            
            // Force instant sidebar badge update
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });

            if (selectedKyc?._id === id || selectedKyc?.id === id) {
                setIsSheetOpen(false);
            }
        } catch (err) {
            toast.error(err.message || "Failed to approve KYC");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Please enter a reason for rejection:");
        if (reason === null) return;
        if (!reason.trim()) {
            toast.error("Rejection reason is required");
            return;
        }

        setActionLoading(id);
        try {
            await adminApi.rejectKYC(id, reason);
            toast.success("KYC rejected successfully");

            // Refetch data
            await refetch();
            
            // Force instant sidebar badge update
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });

            if (selectedKyc?._id === id || selectedKyc?.id === id) {
                setIsSheetOpen(false);
            }
        } catch (err) {
            toast.error(err.message || "Failed to reject KYC");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {!mounted || (loading && kycRecords.length === 0) ? (
                <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <TooltipProvider>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">KYC Verification</h1>
                            <p className="text-sm text-gray-500 mt-1 font-medium">Review and approve user identity documents.</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 shadow-sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export Requests
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <Card key={stat.title} className="border-none shadow-sm py-2">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{stat.title}</p>
                                        <p className="text-xl font-black text-gray-900 leading-none mt-1">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Main Content */}
                    <Card className="border-none shadow-sm overflow-hidden py-1">
                        <CardHeader className="bg-white px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
                            <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-blue-600" />
                                Identity Verification Requests
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
                                <Button variant="outline" size="sm" className="h-9 border-gray-200 text-xs font-bold">
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
                                        <TableHead className="text-xs font-black text-gray-500 uppercase px-6 py-4">User</TableHead>
                                        <TableHead className="text-xs font-black text-gray-500 uppercase">Document Type</TableHead>
                                        <TableHead className="text-xs font-black text-gray-500 uppercase">Document ID</TableHead>
                                        <TableHead className="text-xs font-black text-gray-500 uppercase">Status</TableHead>
                                        <TableHead className="text-xs font-black text-gray-500 uppercase">Submitted</TableHead>
                                        <TableHead className="text-right px-6 text-xs font-black text-gray-500 uppercase">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kycRecords.length > 0 ? (
                                        kycRecords.map((req, index) => (
                                            <TableRow key={req.id || index} className="hover:bg-gray-50/50 transition-colors group">
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black uppercase text-slate-600">
                                                            {req.user?.name?.split(" ").map(n => n[0]).join("") || 'U'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{req.user?.name}</p>
                                                            <p className="text-[10px] text-gray-400 truncate italic font-mono">{req.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-[11px] font-bold text-gray-700 uppercase">
                                                    <div className="flex items-center gap-1.5 font-black tracking-widest text-[#2563eb]">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        {req.documentType || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-[10px] font-mono font-bold text-gray-500">
                                                    <span>{req.documentNumber || (req.aadharNumber && req.panNumber ? `${req.aadharNumber} / ${req.panNumber}` : req.aadharNumber || req.panNumber || '—')}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={req.status} />
                                                </TableCell>
                                                <TableCell className="text-[10px] font-bold text-gray-500">
                                                    {new Date(req.submittedAt || req.createdAt).toLocaleDateString()}
                                                </TableCell>
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
                                                            <TooltipContent className="text-[10px]">Review KYC</TooltipContent>
                                                        </Tooltip>
                                                        {req.status === "pending" && (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-green-600 hover:bg-green-50"
                                                                            disabled={actionLoading === req.id}
                                                                            onClick={() => handleApprove(req.id)}
                                                                        >
                                                                            {actionLoading === req.id ? (
                                                                                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                                            ) : (
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            )}
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="text-[10px]">Approve</TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-red-600 hover:bg-red-50"
                                                                            disabled={actionLoading === req.id}
                                                                            onClick={() => handleReject(req.id)}
                                                                        >
                                                                            {actionLoading === req.id ? (
                                                                                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                                            ) : (
                                                                                <X className="w-3.5 h-3.5" />
                                                                            )}
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="text-[10px]">Reject</TooltipContent>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <FileCheck className="w-10 h-10 text-gray-200 mb-3" />
                                                    <p className="font-bold">No requests found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {kycRecords.map((req, index) => (
                                <div key={req.id || index} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{req.user?.name}</p>
                                            <p className="text-[10px] text-gray-400 italic">{req.user?.email}</p>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 text-[11px] bg-slate-50/50 p-2 rounded-lg border border-slate-100 font-mono font-bold text-slate-700">
                                        <div className="flex justify-between">
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Type</p>
                                            <p className="uppercase">{req.documentType || 'N/A'}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">ID Number</p>
                                            <p>{req.documentNumber || req.aadharNumber || req.panNumber || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <p className="text-[10px] text-gray-400 font-bold">
                                            {new Date(req.submittedAt || req.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-black" onClick={() => handleViewDetails(req)}>
                                                Review
                                            </Button>
                                            {req.status === "pending" && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="h-8 text-[11px] font-black bg-green-600 hover:bg-green-700"
                                                    disabled={actionLoading === req.id}
                                                    onClick={() => handleApprove(req.id)}
                                                >
                                                    {actionLoading === req.id ? (
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                                    ) : "Approve"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <CardFooter className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">
                                Showing <span className="text-gray-900">{(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, pagination?.total || 0)}</span> of <span className="text-gray-900">{pagination?.total || 0}</span> requests
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
            )
            }

            {/* KYC Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="p-0 sm:max-w-xl border-l-0 shadow-2xl overflow-y-auto">
                    {selectedKyc && (
                        <div className="flex flex-col h-full bg-slate-50/20">
                            <SheetHeader className="p-8 border-b bg-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-2xl font-black text-slate-900 leading-none">{selectedKyc.user?.name}</SheetTitle>
                                        <p className="text-[11px] text-slate-400 font-mono mt-1.5 uppercase font-bold tracking-tight">{selectedKyc.id}</p>
                                        <div className="mt-4">
                                            <StatusBadge status={selectedKyc.status} />
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="p-8 space-y-10 overflow-y-auto flex-1">
                                {/* Identity Numbers */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        Identity Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1.5">Document Type</p>
                                            <p className="text-sm font-black text-[#2563eb] font-mono tracking-widest uppercase">{selectedKyc.documentType || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1.5">Document ID Number</p>
                                            <p className="text-sm font-black text-slate-900 font-mono tracking-widest uppercase">{selectedKyc.documentNumber || selectedKyc.aadharNumber || selectedKyc.panNumber || 'MISSING'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Details */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="w-4 h-4 text-indigo-500" />
                                        Submission Timeline
                                    </h3>
                                    <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-bold uppercase font-mono">Submitted Date</span>
                                            <span className="text-xs font-black text-slate-900">{new Date(selectedKyc.submittedAt || selectedKyc.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-bold uppercase font-mono">User Email</span>
                                            <span className="text-xs font-black text-blue-600">{selectedKyc.user?.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                        Uploaded Documents
                                    </h3>

                                    {/* Front Side */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase ml-1">Front Side Photo</p>
                                        <div className="relative group">
                                            <div className="aspect-video w-full rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                                                {selectedKyc.frontUrl || selectedKyc.aadharUrl ? (
                                                    <img
                                                        src={selectedKyc.frontUrl || selectedKyc.aadharUrl}
                                                        alt="Front Document"
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400">Front document URL missing</span>
                                                )}
                                            </div>
                                            {(selectedKyc.frontUrl || selectedKyc.aadharUrl) && (
                                                <Button
                                                    asChild
                                                    variant="secondary"
                                                    size="sm"
                                                    className="absolute bottom-4 right-4 h-8 text-[10px] font-black bg-white/90 backdrop-blur-sm shadow-xl"
                                                >
                                                    <a href={selectedKyc.frontUrl || selectedKyc.aadharUrl} target="_blank" rel="noopener noreferrer">
                                                        View Full Proof <ExternalLink className="w-3 h-3 ml-2" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase ml-1">Back Side Photo</p>
                                        <div className="relative group">
                                            <div className="aspect-video w-full rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                                                {selectedKyc.backUrl || selectedKyc.panUrl ? (
                                                    <img
                                                        src={selectedKyc.backUrl || selectedKyc.panUrl}
                                                        alt="Back Document"
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400">Back document URL missing</span>
                                                )}
                                            </div>
                                            {(selectedKyc.backUrl || selectedKyc.panUrl) && (
                                                <Button
                                                    asChild
                                                    variant="secondary"
                                                    size="sm"
                                                    className="absolute bottom-4 right-4 h-8 text-[10px] font-black bg-white/90 backdrop-blur-sm shadow-xl"
                                                >
                                                    <a href={selectedKyc.backUrl || selectedKyc.panUrl} target="_blank" rel="noopener noreferrer">
                                                        View Full Proof <ExternalLink className="w-3 h-3 ml-2" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedKyc.status === 'pending' && (
                                <div className="p-6 border-t bg-white flex gap-4">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-xs font-black h-12 shadow-lg shadow-green-100"
                                        disabled={actionLoading === selectedKyc.id}
                                        onClick={() => handleApprove(selectedKyc.id)}
                                    >
                                        {actionLoading === selectedKyc.id ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        ) : (
                                            <Check className="w-4 h-4 mr-2" />
                                        )}
                                        Approve Verification
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-600 border-red-100 hover:bg-red-50 text-xs font-black h-12"
                                        disabled={actionLoading === selectedKyc.id}
                                        onClick={() => handleReject(selectedKyc.id)}
                                    >
                                        {actionLoading === selectedKyc.id ? (
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                                        ) : (
                                            <XCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Reject Submission
                                    </Button>
                                </div>
                            )}

                            {selectedKyc.status === 'rejected' && (
                                <div className="p-6 border-t bg-red-50/50">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-red-950 uppercase tracking-tighter">Rejection Reason</p>
                                            <p className="text-sm font-bold text-red-800 mt-1 leading-relaxed">
                                                {selectedKyc.rejectionReason || "No specific reason provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
