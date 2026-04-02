"use client";

import * as React from "react";
import { useState } from "react";
import {
    Search,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Download,
    Eye,
    Plus,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    BadgePercent,
    ArrowUpRight,
    DollarSign,
    Users,
    Info,
    PieChart,
    Activity,
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
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";

import { useAdminReturns } from "@/hooks/useApi"; // Need to create this hook first!

// Placeholder hook implementation if not yet available in useApi.js
// Actually I added useFetch(adminApi.getReturns) but didn't export useAdminReturns hook in hooks/useApi.js.
// I MUST add useAdminReturns to hooks/useApi.js first or inline it.
// I will create the file first assuming hook exists, then add hook.

export default function ReturnsManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    // Using custom hook logic or assuming it will be added
    const { returns, pagination, stats, loading, error, refetch } = useAdminReturns({
        page: currentPage,
        limit: perPage,
        search: searchQuery
    });

    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const statCards = [
        { title: "Total Distributed", value: `$${(stats?.totalDistributed || 0).toLocaleString()}`, icon: DollarSign, color: "text-white", bg: "bg-green-600" },
        { title: "Total Transactions", value: (stats?.totalCount || 0).toLocaleString(), icon: Activity, color: "text-white", bg: "bg-blue-600" },
        // Add more stats if available
    ];

    return (
        <div className="space-y-6">
            {!mounted || (loading && !returns) ? (
                <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <TooltipProvider>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Returns History</h1>
                            <p className="text-sm text-gray-500 mt-1">Track all distributed investment returns.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((stat) => (
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
                                <Activity className="w-4 h-4 text-blue-600" />
                                Return Transactions
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full sm:w-60">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <Input
                                        placeholder="Search user..."
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

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase px-6">Credited Date</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">User</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Index</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Invested</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase">Rate</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 uppercase text-right px-6">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returns.map((ret, i) => (
                                        <TableRow key={i} className="hover:bg-gray-50/50 transition-colors group">
                                            <TableCell className="px-6">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900">{new Date(ret.creditedAt).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono italic">#{ret.week}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{ret.userName}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono truncate">{ret.userEmail}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px] font-bold bg-gray-100 text-gray-700 border-gray-200">
                                                    {ret.indexName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-gray-500">${ret.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <span className="text-[11px] font-bold text-green-600">
                                                    {ret.returnRate}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <span className="text-xs font-black text-green-600">
                                                    +${ret.returnAmount.toFixed(2)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {returns.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-xs text-gray-500 font-medium">
                                                No returns found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {returns.map((ret, i) => (
                                <div key={i} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">{ret.userName}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(ret.creditedAt).toLocaleDateString()} • Week {ret.week}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] font-bold bg-green-50 text-green-700 border-green-100">
                                            +${ret.returnAmount.toFixed(2)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                                        <span>{ret.indexName}</span>
                                        <span className="font-bold text-green-600">{ret.returnRate}% ROI</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <CardFooter className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[11px] text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-bold">{returns.length}</span> of <span className="text-gray-900 font-bold">{pagination?.total || 0}</span> returns
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
                                    disabled={!pagination?.pages || currentPage >= pagination.pages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next Page
                                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </TooltipProvider>
            )}
        </div>
    );
}
