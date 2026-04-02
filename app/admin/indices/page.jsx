"use client";

import * as React from "react";
import { useState } from "react";
import {
    Search,
    Database,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Plus,
    Edit,
    Trash2,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Layers,
    Activity,
    Settings2,
    ChevronLeft,
    ChevronRight,
    SearchX,
    MoreVertical,
    DollarSign,
    Lock,
    Loader2
} from "lucide-react";

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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";



function StatusBadge({ status }) {
    if (status === "active") {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium py-0.5">
                <CheckCircle className="w-3 h-3" />
                Active
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 gap-1 font-medium py-0.5">
            <Lock className="w-3 h-3" />
            Hidden
        </Badge>
    );
}

function VolatilityBadge({ level }) {
    const l = level?.toLowerCase() || "medium";
    const colors = {
        "very low": "bg-blue-50 text-blue-700 border-blue-100",
        "low": "bg-cyan-50 text-cyan-700 border-cyan-100",
        "medium": "bg-yellow-50 text-yellow-700 border-yellow-100",
        "high": "bg-orange-50 text-orange-700 border-orange-100",
        "very high": "bg-red-50 text-red-700 border-red-100"
    };
    return (
        <Badge variant="outline" className={`${colors[l]} text-[10px] font-bold border py-0.5 capitalize`}>
            {l}
        </Badge>
    );
}

import { useAdminIndices } from "@/hooks/useApi";

export default function IndicesManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const [selectedIdx, setSelectedIdx] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "other",
        riskLevel: "medium",
        minInvestment: 100,
        currentReturnRate: 4,
        description: "",
        isActive: true,
        icon: "Shield",
        color: "#2563eb",
        lockPeriod: "1 Year",
        totalInvested: 0,
        activeInvestors: 0
    });

    const [distributeIdx, setDistributeIdx] = useState(null);
    const [isDistributeOpen, setIsDistributeOpen] = useState(false);
    const [distributeData, setDistributeData] = useState({
        returnRate: 0,
        weekStart: new Date().toISOString().split('T')[0],
        weekEnd: new Date().toISOString().split('T')[0]
    });

    const { indices: apiIndices, pagination, loading, error, refetch, create, update, remove, distributeReturns } = useAdminIndices({
        page: currentPage,
        limit: perPage,
        search: searchQuery
    });

    const handleOpenEdit = (idx) => {
        setSelectedIdx(idx);
        setFormData({
            name: idx.name || "",
            category: idx.category || "other",
            riskLevel: idx.riskLevel || "medium",
            minInvestment: idx.minInvestment || 100,
            currentReturnRate: idx.currentReturnRate || 4,
            description: idx.description || "",
            isActive: idx.isActive ?? true,
            icon: idx.icon || "Shield",
            color: idx.color || "#2563eb",
            lockPeriod: idx.lockPeriod || "1 Year",
            totalInvested: idx.totalInvested || 0,
            activeInvestors: idx.activeInvestors || 0
        });
        setIsSheetOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedIdx(null);
        setFormData({
            name: "",
            category: "other",
            riskLevel: "medium",
            minInvestment: 100,
            currentReturnRate: 4,
            description: "",
            isActive: true,
            icon: "Shield",
            color: "#2563eb",
            lockPeriod: "1 Year",
            totalInvested: 0,
            activeInvestors: 0
        });
        setIsSheetOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (selectedIdx) {
                await update(selectedIdx.id, formData);
            } else {
                await create(formData);
            }
            setIsSheetOpen(false);
            refetch();
        } catch (err) {
            console.error("Submit error:", err);
            alert(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to deactivate this index?")) return;
        try {
            await remove(id);
            refetch();
        } catch (err) {
            alert(err.message || "Failed to deactivate");
        }
    };

    const handleOpenDistribute = (idx) => {
        setDistributeIdx(idx);
        setDistributeData({
            ...distributeData,
            returnRate: idx.currentReturnRate || 0
        });
        setIsDistributeOpen(true);
    };

    const handleDistribute = async (e) => {
        e.preventDefault();
        if (!distributeIdx) return;

        setIsSubmitting(true);
        try {
            await distributeReturns(distributeIdx.id, distributeData);
            setIsDistributeOpen(false);
            setDistributeIdx(null);
            refetch();
        } catch (err) {
            console.error("Distribution failed:", err);
            alert(err.message || "Failed to distribute returns");
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = [
        { title: "Active Indices", value: pagination?.total || 0, icon: Database, color: "text-white", bg: "bg-blue-600" },
        { title: "Avg Return", value: apiIndices.length ? `${(apiIndices.reduce((acc, curr) => acc + curr.currentReturnRate, 0) / apiIndices.length).toFixed(1)}%` : "—", icon: TrendingUp, color: "text-white", bg: "bg-green-600" },
        { title: "Asset Classes", value: [...new Set(apiIndices.map(i => i.category))].length || 0, icon: Layers, color: "text-white", bg: "bg-purple-600" },
        { title: "Visible", value: apiIndices.filter(i => i.isActive).length, icon: Activity, color: "text-white", bg: "bg-red-600" },
    ];

    const indicesData = apiIndices || [];
    const totalPages = pagination?.pages || 1;

    const handleViewDetails = (idx) => {
        setSelectedIdx(idx);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            <TooltipProvider>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Investment Indices</h1>
                        <p className="text-sm text-gray-500 mt-1">Configure asset buckets and target return rates.</p>
                    </div>
                    <Button
                        size="sm"
                        className="h-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={handleOpenCreate}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Index
                    </Button>
                </div>

                {/* Stats */}
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

                {/* Main Content */}
                <Card className="border-none shadow-sm overflow-hidden py-2">
                    <CardHeader className="bg-white px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
                        <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            Active Asset Buckets
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full sm:w-60">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <Input
                                    placeholder="Filter by name or class..."
                                    className="pl-9 h-9 text-xs border-gray-200"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-9 border-gray-200">
                                <Filter className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/20">
                                <TableRow>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase px-6">Index Name</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase">Category</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase">Min Invest</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase">Est. Returns</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase">Volatility</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-500 uppercase">Active?</TableHead>
                                    <TableHead className="text-right px-6 text-xs font-bold text-gray-500 uppercase">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {indicesData.map((idx) => (
                                    <TableRow key={idx.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <TableCell className="px-6">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{idx.name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{idx.slug}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{idx.category}</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-black text-gray-900">{idx.minInvestmentFormatted || `$${idx.minInvestment.toLocaleString()}`}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-green-600">
                                                <TrendingUp className="w-3 h-3" />
                                                <span className="text-[11px] font-black">{idx.currentReturnRate}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <VolatilityBadge level={idx.riskLevel} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={idx.isActive ? 'active' : 'inactive'} />
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                                            onClick={() => handleOpenDistribute(idx)}
                                                        >
                                                            <DollarSign className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="text-[10px] font-bold">Distribute Returns</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleOpenEdit(idx)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-[10px]">Edit Config</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(idx.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-[10px]">Archive</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {indicesData.map((idx) => (
                            <div key={idx.id} className="p-4 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{idx.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono tracking-tight">{idx.id}</p>
                                    </div>
                                    <StatusBadge status={idx.isActive ? 'active' : 'inactive'} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Min Investment</p>
                                        <p className="text-sm font-black text-gray-900">${(idx.minInvestment || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Est. ROI</p>
                                        <div className="flex items-center gap-1 text-green-600 font-black text-sm">
                                            {idx.currentReturnRate}%
                                            <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <VolatilityBadge level={idx.riskLevel} />
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold text-purple-600 border-purple-100 hover:bg-purple-50" onClick={() => handleOpenDistribute(idx)}>
                                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                                            Distribute
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold" onClick={() => handleOpenEdit(idx)}>
                                            <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                                            Configure
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(idx.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <CardFooter className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] text-gray-500 font-medium">
                            Total <span className="text-gray-900 font-bold">{pagination?.total || indicesData.length}</span> index configurations
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
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-[11px] font-bold"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </TooltipProvider>

            {/* Index Configuration Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="p-0 sm:max-w-xl border-l overflow-y-auto">
                    {isSheetOpen && (
                        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-50/50">
                            <SheetHeader className="p-6 border-b bg-white shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                                        <div className="absolute inset-0 bg-white/10" />
                                        <Layers className="w-6 h-6 relative z-10" />
                                    </div>
                                    <div className="min-w-0">
                                        <SheetTitle className="text-xl font-black text-gray-900">
                                            {selectedIdx ? "Edit Index" : "Create Index"}
                                        </SheetTitle>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-[0.2em]">
                                            {selectedIdx ? selectedIdx.id : "NEW CONFIGURATION"}
                                        </p>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                                        <Settings2 className="w-3.5 h-3.5" />
                                        Index Core Configuration
                                    </h3>

                                    <div className="grid gap-4">
                                        <div className="grid gap-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Index Name</label>
                                            <Input
                                                required
                                                placeholder="e.g. Bratsk"
                                                className="bg-white border-gray-200"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Category</label>
                                                <select
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                >
                                                    <option value="technology">Technology</option>
                                                    <option value="healthcare">Healthcare</option>
                                                    <option value="finance">Finance</option>
                                                    <option value="energy">Energy</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Icon Name</label>
                                                <select
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={formData.icon}
                                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                >
                                                    <option value="Shield">Shield</option>
                                                    <option value="Activity">Activity</option>
                                                    <option value="BarChart3">Bar Chart</option>
                                                    <option value="PieChart">Pie Chart</option>
                                                    <option value="Layers">Layers</option>
                                                    <option value="TrendingUp">Trending Up</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Risk Level</label>
                                                <select
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={formData.riskLevel}
                                                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Min Invest ($)</label>
                                                <Input
                                                    type="number"
                                                    required
                                                    className="bg-white border-gray-200"
                                                    value={formData.minInvestment}
                                                    onChange={(e) => setFormData({ ...formData, minInvestment: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Return %</label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    className="bg-white border-gray-200"
                                                    value={formData.currentReturnRate}
                                                    onChange={(e) => setFormData({ ...formData, currentReturnRate: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Lock Period</label>
                                                <Input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. 1 Year"
                                                    className="bg-white border-gray-200"
                                                    value={formData.lockPeriod}
                                                    onChange={(e) => setFormData({ ...formData, lockPeriod: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Fund Size ($)</label>
                                                <Input
                                                    type="number"
                                                    required
                                                    className="bg-white border-gray-200"
                                                    value={formData.totalInvested}
                                                    onChange={(e) => setFormData({ ...formData, totalInvested: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Total Investors</label>
                                                <Input
                                                    type="number"
                                                    required
                                                    className="bg-white border-gray-200"
                                                    value={formData.activeInvestors}
                                                    onChange={(e) => setFormData({ ...formData, activeInvestors: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Color (Hex)</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    required
                                                    placeholder="#2563eb"
                                                    className="bg-white border-gray-200 font-mono"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                />
                                                <div
                                                    className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm shrink-0"
                                                    style={{ backgroundColor: formData.color }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Description</label>
                                            <textarea
                                                required
                                                rows={4}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-200"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">Active Status</p>
                                                <p className="text-[10px] text-gray-500">Visible to investors</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <span className="text-xs font-medium">{formData.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 border-t bg-white flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={loading || isSubmitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-black h-12 shadow-lg shadow-blue-100"
                                >
                                    {(loading || isSubmitting) ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    {selectedIdx ? "Save Changes" : "Create Index"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 text-gray-600 border-gray-200 text-xs font-black h-12"
                                    onClick={() => setIsSheetOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </SheetContent>
            </Sheet>

            {/* Distribute Returns Dialog */}
            <Dialog open={isDistributeOpen} onOpenChange={setIsDistributeOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            Distribute Returns
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Confirm weekly returns for <span className="font-bold text-gray-900">{distributeIdx?.name}</span>.
                            This will credit all active investors of this index.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDistribute} className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Return Rate (%)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="h-12 pl-4 pr-10 font-bold text-lg"
                                        value={distributeData.returnRate}
                                        onChange={(e) => setDistributeData({ ...distributeData, returnRate: Number(e.target.value) })}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Week Start</Label>
                                    <Input
                                        type="date"
                                        required
                                        className="h-10 text-xs font-bold"
                                        value={distributeData.weekStart}
                                        onChange={(e) => setDistributeData({ ...distributeData, weekStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Week End</Label>
                                    <Input
                                        type="date"
                                        required
                                        className="h-10 text-xs font-bold"
                                        value={distributeData.weekEnd}
                                        onChange={(e) => setDistributeData({ ...distributeData, weekEnd: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">Active Investors</p>
                                    <p className="text-sm font-bold text-gray-900">{distributeIdx?.activeInvestors || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">Total Principal</p>
                                    <p className="text-sm font-bold text-gray-900">${(distributeIdx?.totalInvested || 0).toLocaleString()}</p>
                                </div>
                                <div className="col-span-2 pt-3 mt-1 border-t border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">Est. Distribution Amount</p>
                                    <p className="text-lg font-black text-purple-600">
                                        ${((distributeIdx?.totalInvested || 0) * (distributeData.returnRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border ${distributeData.returnRate < 0 ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100'}`}>
                                <p className={`text-[11px] leading-relaxed ${distributeData.returnRate < 0 ? 'text-red-800' : 'text-purple-800'}`}>
                                    <span className="font-bold">
                                        {distributeData.returnRate < 0 ? 'Warning:' : 'Pro-Tip:'}
                                    </span>
                                    {distributeData.returnRate < 0
                                        ? " You have entered a negative return rate. This will result in a LOSS for all active investors. Please confirm if this is intentional."
                                        : " Ensure you have verified that this week's results matches the distributed percentage. This action cannot be undone."}
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs font-black h-11"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Confirm Distribution
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 text-gray-500 font-bold h-11"
                                onClick={() => setIsDistributeOpen(false)}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

