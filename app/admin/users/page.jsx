"use client";

import * as React from "react";
import { useState } from "react";
import {
    Search,
    Users,
    CheckCircle,
    TrendingUp,
    XCircle,
    Filter,
    Download,
    Eye,
    Edit,
    Mail,
    Phone,
    Shield,
    Trash2,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    CheckCircle2,
    ShieldAlert,
    UserCheck,
    UserMinus,
    Plus,
} from "lucide-react";

import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { useAdminUsers } from "@/hooks/useApi";
import { toast } from "react-hot-toast";

// Format number
function formatNumber(num) {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat('en-US').format(num);
}

// KYC Status Badge with icons
const KYCBadge = React.memo(function KYCBadge({ status }) {
    if (status === "approved" || status === "verified") {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3" />
                Approved
            </Badge>
        );
    }
    if (status === "rejected" || status === "failed") {
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-medium whitespace-nowrap">
                <XCircle className="w-3 h-3" />
                Rejected
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-medium whitespace-nowrap">
            <Clock className="w-3 h-3" />
            Pending
        </Badge>
    );
});

// Account Status Badge with icons
const AccountStatusBadge = React.memo(function AccountStatusBadge({ isActive }) {
    if (isActive) {
        return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-medium whitespace-nowrap">
                <UserCheck className="w-3 h-3" />
                Active
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 gap-1 font-medium whitespace-nowrap">
            <ShieldAlert className="w-3 h-3 text-red-500" />
            Blocked
        </Badge>
    );
});

export default function AdminUsersPage() {
    // 1. FILTER & SEARCH STATE
    // Manages the current parameters passed to the API query
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        kycStatus: "all",
        isActive: "all",
    });
    
    // 2. PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    // 3. REACT QUERY DATA FETCHING
    // Automatically re-fetches whenever page, search, or filters change.
    // Handles caching, loading, and error states seamlessly.
    const { users: apiUsers, pagination, loading, error, refetch } = useAdminUsers({
        page: currentPage,
        limit: perPage,
        search: searchQuery,
        kycStatus: filters.kycStatus === 'all' ? undefined : filters.kycStatus,
        isActive: filters.isActive === 'all' ? undefined : (filters.isActive === 'active' ? 'true' : 'false')
    });

    const [selectedIds, setSelectedIds] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const startEditing = React.useCallback((user) => {
        setEditData({
            name: user.name,
            phone: user.phone,
            role: user.role,
            accumulationBonus: user.accumulationBonus || 0
        });
        setIsEditing(true);
    }, []);

    const handleUpdateProfile = React.useCallback(async () => {
        setIsSubmitting(true);
        try {
            await adminApi.updateUser(selectedUser._id, editData);
            toast.success("User profile updated successfully");
            setIsEditing(false);
            setDetailSheetOpen(false);
            refetch();
        } catch (err) {
            toast.error(err.message || "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedUser, editData, refetch]);

    // Stats
    const statsConfig = React.useMemo(() => [
        { title: "Total Users", value: pagination?.total ?? 0, icon: Users, color: "text-white", bg: "bg-blue-600" },
        { title: "KYC Verified", value: pagination?.kycVerifiedTotal ?? 0, icon: CheckCircle, color: "text-white", bg: "bg-green-600" },
        { title: "Active Investors", value: pagination?.activeInvestorsTotal ?? 0, icon: TrendingUp, color: "text-white", bg: "bg-purple-600" },
        { title: "Blocked Accounts", value: pagination?.blockedTotal ?? 0, icon: XCircle, color: "text-white", bg: "bg-red-600" },
    ], [pagination]);

    const handleSelectAll = React.useCallback((checked) => {
        if (checked) {
            setSelectedIds(apiUsers.map((u) => u._id));
        } else {
            setSelectedIds([]);
        }
    }, [apiUsers]);

    const handleSelect = React.useCallback((id, checked) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((i) => i !== id));
        }
    }, []);

    const toggleUserStatus = React.useCallback(async (user) => {
        try {
            const newStatus = !user.isActive;
            await adminApi.updateUser(user._id, { isActive: newStatus });
            toast.success(`User ${newStatus ? 'unblocked' : 'blocked'} successfully`);
            refetch();
        } catch (err) {
            toast.error(err.message || 'Failed to update user status');
        }
    }, [refetch]);

    const handleDeleteUser = React.useCallback(async (user) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete user "${user.name}"? This action cannot be undone and will remove all their investments, payments, and data.`)) {
            return;
        }

        try {
            await adminApi.deleteUser(user._id);
            toast.success("User deleted successfully");
            setDetailSheetOpen(false);
            refetch();
        } catch (err) {
            toast.error(err.message || "Failed to delete user");
        }
    }, [refetch]);

    const viewUserDetail = React.useCallback((user) => {
        setSelectedUser(user);
        setDetailSheetOpen(true);
    }, []);

    return (
        <div className="space-y-6">
            {!mounted || loading ? (
                <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <TooltipProvider>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Users Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage platform users, verify KYC, and track investments.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statsConfig.map((stat) => (
                            <Card key={stat.title} className="border-none shadow-sm py-2">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">{stat.title}</p>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(stat.value)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden py-2">
                        <CardHeader className="bg-white px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
                            <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                All Platform Users
                            </CardTitle>
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <div className="relative w-full sm:w-60">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <Input
                                        placeholder="Search name, email, id..."
                                        className="pl-9 h-9 text-xs border-gray-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-full sm:w-auto border-gray-200 text-xs"
                                    onClick={() => setShowFilters(true)}
                                >
                                    <Filter className="w-3.5 h-3.5 mr-2" />
                                    Filters
                                    {(filters.kycStatus !== "all" || filters.isActive !== "all") && (
                                        <span className="ml-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>

                        {/* Table View (Desktop) */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-12 px-6">
                                            <Checkbox
                                                checked={selectedIds.length === apiUsers?.length && (apiUsers?.length || 0) > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">User</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Contact</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">KYC Status</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Investments</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Status</TableHead>
                                        <TableHead className="text-right px-6 text-xs font-bold text-gray-500 uppercase">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {apiUsers?.length > 0 ? (
                                        apiUsers.map((user) => (
                                            <TableRow key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <TableCell className="px-6">
                                                    <Checkbox
                                                        checked={selectedIds.includes(user._id)}
                                                        onCheckedChange={(checked) => handleSelect(user._id, checked)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shrink-0 uppercase">
                                                            {user.name?.split(" ").map(n => n[0]).join("") || 'U'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-mono italic">{user._id}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-0.5 min-w-[140px]">
                                                        <p className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            {user.email}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            {user.phoneNumber || '—'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <KYCBadge status={user.kycStatus} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-bold text-gray-900">${formatNumber(user.totalInvested || 0)}</p>
                                                        <p className="text-[10px] text-gray-500">{user.activeInvestments || 0} Active</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <AccountStatusBadge isActive={user.isActive} />
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                                                                    onClick={() => viewUserDetail(user)}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px]">View Detail</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`h-7 w-7 ${user.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                                    onClick={() => toggleUserStatus(user)}
                                                                >
                                                                    {user.isActive ? <ShieldAlert className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px]">{user.isActive ? 'Block User' : 'Unblock User'}</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleDeleteUser(user)}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px]">Delete User</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <Users className="w-10 h-10 text-gray-200 mb-3" />
                                                    <p className="font-medium">No users found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Card View (Mobile) */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {apiUsers?.map((user) => (
                                <div key={user._id} className="p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0 uppercase">
                                                {user.name?.split(" ").map(n => n[0]).join("") || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{user._id}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600"
                                            onClick={() => viewUserDetail(user)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                                        <div className="space-y-1">
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">KYC</p>
                                            <KYCBadge status={user.kycStatus} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Status</p>
                                            <AccountStatusBadge isActive={user.isActive} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Contact</p>
                                            <p className="font-semibold text-gray-700 truncate">{user.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Invested</p>
                                            <p className="font-black text-gray-900">${formatNumber(user.totalInvested || 0)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-gray-50">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`flex-1 h-8 text-[11px] font-black ${user.isActive ? 'text-orange-600 border-orange-100' : 'text-green-600 border-green-100'}`}
                                            onClick={() => toggleUserStatus(user)}
                                        >
                                            {user.isActive ? <ShieldAlert className="w-3 h-3 mr-1.5" /> : <UserCheck className="w-3 h-3 mr-1.5" />}
                                            {user.isActive ? 'Block' : 'Unblock'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 px-0 text-red-600 border-red-100 hover:bg-red-50"
                                            onClick={() => handleDeleteUser(user)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <CardFooter className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[11px] text-gray-500 font-medium">
                                Total <span className="text-gray-900 font-bold">{pagination?.total || 0}</span> users found
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

                    {/* Filter Sheet */}
                    <Sheet open={showFilters} onOpenChange={setShowFilters}>
                        <SheetContent side="right" className="w-full sm:max-w-md p-0">
                            <SheetHeader className="px-6 py-4 border-b">
                                <SheetTitle className="flex items-center gap-2 text-base">
                                    <Filter className="w-4 h-4 text-blue-600" />
                                    Filter Users
                                </SheetTitle>
                            </SheetHeader>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">KYC Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["all", "pending", "approved", "rejected"].map((status) => (
                                            <Button
                                                key={status}
                                                variant={filters.kycStatus === status ? "default" : "outline"}
                                                size="sm"
                                                className="capitalize text-[11px] font-bold h-8"
                                                onClick={() => setFilters({ ...filters, kycStatus: status })}
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["all", "active", "blocked"].map((status) => (
                                            <Button
                                                key={status}
                                                variant={filters.isActive === status ? "default" : "outline"}
                                                size="sm"
                                                className="capitalize text-[11px] font-bold h-8"
                                                onClick={() => setFilters({ ...filters, isActive: status })}
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 text-[11px] font-bold"
                                    onClick={() => setFilters({ kycStatus: "all", isActive: "all" })}
                                >
                                    Reset
                                </Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold" onClick={() => setShowFilters(false)}>
                                    Apply Filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* User Detail Sheet */}
                    <Sheet open={detailSheetOpen} onOpenChange={(open) => {
                        setDetailSheetOpen(open);
                        if (!open) {
                            setIsEditing(false);
                            setEditData(null);
                        }
                    }}>
                        <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-y-auto border-l">
                            {selectedUser && (
                                <div className="flex flex-col h-full bg-slate-50/10">
                                    <SheetHeader className="px-6 py-6 border-b bg-white">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 shrink-0 uppercase">
                                                {selectedUser.name?.split(" ").map(n => n[0]).join("") || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <SheetTitle className="text-xl font-black text-gray-900 truncate">{selectedUser.name}</SheetTitle>
                                                <p className="text-[10px] text-gray-400 font-mono italic tracking-tight">{selectedUser._id}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                    <KYCBadge status={selectedUser.kycStatus} />
                                                    <AccountStatusBadge isActive={selectedUser.isActive} />
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1 font-medium whitespace-nowrap uppercase text-[10px]">
                                                        {selectedUser.role}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </SheetHeader>

                                    <div className="p-6 space-y-8">
                                        {isEditing ? (
                                            <div className="space-y-6">
                                                <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Edit User Profile</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                                        <Input
                                                            value={editData.name}
                                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                            className="h-10 text-xs font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                                        <Input
                                                            value={editData.phone}
                                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                            className="h-10 text-xs font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User Role</label>
                                                        <select
                                                            value={editData.role}
                                                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                            className="w-full h-10 px-3 text-xs font-bold rounded-md border border-input bg-background"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="master_admin">Master Admin</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accumulation Bonus ($)</label>
                                                        <Input
                                                            type="number"
                                                            value={editData.accumulationBonus}
                                                            onChange={(e) => setEditData({ ...editData, accumulationBonus: Number(e.target.value) })}
                                                            className="h-10 text-xs font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <Card className="border-none shadow-sm bg-white p-4">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Total Assets</p>
                                                        <p className="text-xl font-black text-gray-900">${formatNumber(selectedUser.totalInvested || 0)}</p>
                                                    </Card>
                                                    <Card className="border-none shadow-sm bg-white p-4">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Accumulation Bonus</p>
                                                        <p className="text-xl font-black text-blue-600">${formatNumber(selectedUser.accumulationBonus || 0)}</p>
                                                    </Card>
                                                    <Card className="border-none shadow-sm bg-white p-4">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Active Plans</p>
                                                        <p className="text-xl font-black text-gray-900">{selectedUser.activeInvestments || 0}</p>
                                                    </Card>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-indigo-500" />
                                                        Communication
                                                    </h3>
                                                    <Card className="border-none shadow-sm bg-white overflow-hidden divide-y divide-gray-50">
                                                        <div className="p-4 flex justify-between items-center">
                                                            <span className="text-xs text-gray-500 font-medium font-mono uppercase">Primary Email</span>
                                                            <span className="text-xs font-bold text-gray-900">{selectedUser.email}</span>
                                                        </div>
                                                        <div className="p-4 flex justify-between items-center">
                                                            <span className="text-xs text-gray-500 font-medium font-mono uppercase">Phone No.</span>
                                                            <span className="text-xs font-bold text-gray-900">{selectedUser.phone || selectedUser.phoneNumber || '—'}</span>
                                                        </div>
                                                    </Card>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-indigo-500" />
                                                        Account Timeline
                                                    </h3>
                                                    <Card className="border-none shadow-sm bg-white p-4 space-y-4">
                                                        <div className="flex justify-between">
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Member Since</p>
                                                            <p className="text-xs font-bold text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—'}</p>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Last Seen</p>
                                                            <p className="text-xs font-bold text-blue-600">{selectedUser.lastActivity ? new Date(selectedUser.lastActivity).toLocaleDateString() : 'Active now'}</p>
                                                        </div>
                                                    </Card>
                                                </div>

                                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                                                    <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-orange-950 font-black leading-none mb-1">Critical Action Zone</p>
                                                        <p className="text-[10px] text-orange-800 font-semibold leading-tight">
                                                            Blocking a user prevents all withdrawals and investments.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-auto p-4 border-t bg-white flex gap-3">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-11 text-xs font-black border-gray-200"
                                                    onClick={() => setIsEditing(false)}
                                                    disabled={isSubmitting}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="flex-[2] h-11 text-xs font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                                                    onClick={handleUpdateProfile}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    className="flex-1 h-11 text-xs font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                                                    onClick={() => startEditing(selectedUser)}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Update Profile
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className={`flex-1 h-11 text-xs font-black ${selectedUser.isActive ? 'text-orange-600 border-orange-100 hover:bg-orange-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}
                                                    onClick={() => { toggleUserStatus(selectedUser); setDetailSheetOpen(false); }}
                                                >
                                                    {selectedUser.isActive ? <ShieldAlert className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                                                    {selectedUser.isActive ? 'Suspend Access' : 'Restore Access'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-11 h-11 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDeleteUser(selectedUser)}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                </TooltipProvider>
            )}
        </div>
    );
}
