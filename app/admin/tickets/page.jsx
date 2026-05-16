"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
    Search, MessageSquare, Clock, CheckCircle, X, Send,
    Paperclip, ChevronDown, Flag, UserPlus, MoreVertical,
    MoreHorizontal, Grid3x3, List, Settings, XCircle, Star,
    RefreshCcw, Filter, CreditCard, ShieldCheck, ArrowDownCircle,
    TrendingUp, HelpCircle, Home, Loader2, Eye, User, Inbox,
    ChevronRight, AlertTriangle, CheckCheck, Circle
} from "lucide-react";
import { toast } from "react-hot-toast";

// Breadcrumb imports removed as AdminLayout handles it
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useAdminTickets, useAdminTicket } from "@/hooks/useApi";
import { adminApi } from "@/lib/api";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = {
    payment: { label: "Payment", color: "bg-blue-100 text-blue-700", icon: CreditCard },
    kyc: { label: "KYC", color: "bg-purple-100 text-purple-700", icon: ShieldCheck },
    withdrawal: { label: "Withdrawal", color: "bg-orange-100 text-orange-700", icon: ArrowDownCircle },
    investment: { label: "Investment", color: "bg-green-100 text-green-700", icon: TrendingUp },
    account: { label: "Account", color: "bg-gray-100 text-gray-700", icon: User },
    other: { label: "Other", color: "bg-gray-100 text-gray-600", icon: HelpCircle },
};

const STATUS_CONFIG = {
    open: { label: "Open", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    "in-progress": { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    waiting: { label: "Waiting", cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    resolved: { label: "Resolved", cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
    closed: { label: "Closed", cls: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

const PRIORITY_CONFIG = {
    urgent: { label: "Urgent", cls: "text-red-600 bg-red-50 border-red-200" },
    high: { label: "High", cls: "text-orange-600 bg-orange-50 border-orange-200" },
    medium: { label: "Medium", cls: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    low: { label: "Low", cls: "text-green-600 bg-green-50 border-green-200" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d) {
    if (!d) return "—";
    const date = new Date(d);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const h = date.getHours(), m = date.getMinutes().toString().padStart(2, "0");
    return `${date.getDate()} ${months[date.getMonth()]}, ${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

function fmtShort(d) {
    if (!d) return "—";
    const date = new Date(d);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

function initials(name) {
    if (!name) return "U";
    return name.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function PriorityDot({ priority }) {
    const cfg = PRIORITY_CONFIG[priority];
    if (!cfg) return null;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

// ─── Ticket Row (List View) ───────────────────────────────────────────────────

function TicketRow({ ticket, onView, isSelected }) {
    const cat = CATEGORIES[ticket.category] || CATEGORIES.other;
    const CatIcon = cat.icon;
    return (
        <div
            onClick={() => onView(ticket)}
            className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50/40 group ${isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent"}`}
        >
            {/* Category icon */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                <CatIcon className="w-3.5 h-3.5" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-black text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                        {ticket.subject}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium truncate">
                        {ticket.user?.name || "Unknown"} · #{ticket.ticketId?.slice(-6) || ticket.id?.slice(-6)}
                    </span>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={ticket.status} />
                {ticket.priority && ticket.priority !== "low" && <PriorityDot priority={ticket.priority} />}
                <span className="text-[10px] text-gray-400 font-medium w-12 text-right">{fmtShort(ticket.createdAt)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
            </div>
        </div>
    );
}

// ─── Ticket Card (Grid View) ──────────────────────────────────────────────────

function TicketCard({ ticket, onView, isSelected }) {
    const cat = CATEGORIES[ticket.category] || CATEGORIES.other;
    const CatIcon = cat.icon;
    return (
        <div
            onClick={() => onView(ticket)}
            className={`bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group ${isSelected ? "border-blue-400 shadow-md shadow-blue-100" : "border-gray-100 shadow-sm"}`}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cat.color}`}>
                        <CatIcon className="w-3 h-3" />
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        #{ticket.ticketId?.slice(-6) || ticket.id?.slice(-6)}
                    </span>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            {/* Subject */}
            <div className="px-3 pb-2">
                <p className="text-[12px] font-black text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {ticket.subject}
                </p>
            </div>

            {/* User */}
            <div className="px-3 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[8px] font-black">
                        {initials(ticket.user?.name)}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium truncate max-w-[80px]">
                        {ticket.user?.name || "Unknown"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {ticket.priority && ticket.priority !== "low" && <PriorityDot priority={ticket.priority} />}
                    <span className="text-[9px] text-gray-400">{fmtShort(ticket.createdAt)}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Ticket Detail Panel ──────────────────────────────────────────────────────

function TicketPanel({ ticketId, onClose }) {
    const { ticket, loading, reply, update } = useAdminTicket(ticketId);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            await reply(replyText);
            setReplyText("");
            toast.success("Reply sent");
        } catch (e) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleUpdate = async (data) => {
        try {
            await update(data);
            toast.success("Ticket updated");
        } catch (e) {
            toast.error("Failed to update ticket");
        }
    };

    if (loading && !ticket) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!ticket) return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Inbox className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm font-bold text-gray-400">Select a ticket to view details</p>
        </div>
    );

    const cat = CATEGORIES[ticket.category] || CATEGORIES.other;
    const CatIcon = cat.icon;

    return (
        <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                        <CatIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate leading-tight">{ticket.subject}</p>
                        <p className="text-[10px] text-gray-400">#{ticket.ticketId || ticket.id?.slice(-8)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={ticket.status} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700">
                                <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-gray-400">Priority</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {["urgent", "high", "medium", "low"].map(p => (
                                <DropdownMenuItem key={p} onClick={() => handleUpdate({ priority: p })} className="text-[11px] font-bold gap-2">
                                    <span className={`w-2 h-2 rounded-full ${p === "urgent" ? "bg-red-500" : p === "high" ? "bg-orange-500" : p === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            {ticket.status !== "closed" && (
                                <DropdownMenuItem onClick={() => handleUpdate({ status: "closed" })} className="text-[11px] font-bold text-red-600 gap-2">
                                    <XCircle className="w-3.5 h-3.5" /> Close Ticket
                                </DropdownMenuItem>
                            )}
                            {ticket.status === "closed" && (
                                <DropdownMenuItem onClick={() => handleUpdate({ status: "open" })} className="text-[11px] font-bold text-green-600 gap-2">
                                    <CheckCircle className="w-3.5 h-3.5" /> Reopen
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* User Info Bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50/40 border-b border-blue-100/60 shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {initials(ticket.user?.name)}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{ticket.user?.name || "Unknown User"}</p>
                    <p className="text-[11px] text-gray-500 truncate">{ticket.user?.email || "—"}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400">{fmtShort(ticket.createdAt)}</p>
                    {ticket.priority && <PriorityDot priority={ticket.priority} />}
                </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f7f8fa]">
                {/* Initial message */}
                <div className="flex flex-col items-start max-w-[88%]">
                    <div className="flex items-center gap-1.5 mb-1 px-0.5">
                        <span className="text-[10px] font-semibold text-gray-500">{ticket.user?.name || "User"}</span>
                        <span className="text-[9px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{fmtShort(ticket.createdAt)}</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                        <p className="text-[13px] text-gray-700 leading-relaxed">{ticket.description}</p>
                    </div>
                </div>

                {/* Messages */}
                {(ticket.messages || []).map((msg, i) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                        <div key={msg._id || msg.id || i} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} max-w-[88%] ${isAdmin ? "ml-auto" : ""}`}>
                            <div className={`flex items-center gap-1.5 mb-1 px-0.5 ${isAdmin ? "flex-row-reverse" : ""}`}>
                                <span className={`text-[10px] font-medium ${isAdmin ? "text-blue-600" : "text-gray-500"}`}>
                                    {isAdmin ? (msg.senderName || "Support") : (ticket.user?.name || "User")}
                                </span>
                                <span className="text-[9px] text-gray-300">·</span>
                                <span className="text-[10px] text-gray-400">{fmtShort(msg.timestamp)}</span>
                            </div>
                            <div className={`rounded-xl px-3.5 py-2.5 shadow-sm ${isAdmin
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"
                                }`}>
                                <p className="text-[13px] leading-relaxed">{msg.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reply Box */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                {ticket.status !== "closed" ? (
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                            placeholder="Type a reply... (Ctrl+Enter to send)"
                            rows={2}
                            className="flex-1 resize-none text-[12px] px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none transition-all placeholder:text-gray-400"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!replyText.trim() || sending}
                            className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 shrink-0"
                        >
                            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-dashed border-gray-200">
                        <p className="text-[11px] font-bold text-gray-400">Ticket is closed</p>
                        <Button variant="outline" size="sm" onClick={() => handleUpdate({ status: "open" })} className="h-7 text-[10px] font-black uppercase tracking-wider">
                            <RefreshCcw className="w-3 h-3 mr-1.5" /> Reopen
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTicketsPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("list");
    const [mounted, setMounted] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const { tickets, loading, refetch, stats: apiStats } = useAdminTickets({ status: activeTab });

    useEffect(() => { setMounted(true); }, []);

    const stats = {
        open: apiStats?.open || 0,
        inProgress: apiStats?.["in-progress"] || 0,
        waiting: apiStats?.waiting || 0,
        resolved: apiStats?.resolved || 0,
        closed: apiStats?.closed || 0,
        total: apiStats?.total || 0,
    };

    const TABS = [
        { id: "all", label: "All", count: stats.total },
        { id: "open", label: "Open", count: stats.open },
        { id: "in-progress", label: "In Progress", count: stats.inProgress },
        { id: "waiting", label: "Waiting", count: stats.waiting },
        { id: "resolved", label: "Resolved", count: stats.resolved },
        { id: "closed", label: "Closed", count: stats.closed },
    ];

    const filtered = (tickets || []).filter(t => {
        if (!t) return false;
        const matchTab = activeTab === "all" || t.status === activeTab;
        const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || t.subject?.toLowerCase().includes(q)
            || t.user?.name?.toLowerCase().includes(q)
            || t.ticketId?.toLowerCase().includes(q);
        return matchTab && matchPriority && matchSearch;
    });

    if (!mounted) return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="flex flex-col overflow-hidden -mx-4 lg:-mx-6 -mt-4 lg:-mt-6" style={{ height: 'calc(100vh - 3.5rem)' }}>
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    {/* Breadcrumb removed as AdminLayout handles it globally */}
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        Tickets Inbox
                    </h2>
                </div>

                {/* Stats Pills */}
                <div className="hidden md:flex items-center gap-1.5">
                    {[
                        { label: "Open", value: stats.open, cls: "bg-blue-50 text-blue-700" },
                        { label: "Waiting", value: stats.waiting, cls: "bg-orange-50 text-orange-700" },
                        { label: "Resolved", value: stats.resolved, cls: "bg-green-50 text-green-700" },
                        { label: "Total", value: stats.total, cls: "bg-gray-100 text-gray-600" },
                    ].map(s => (
                        <span key={s.label} className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.cls}`}>
                            {s.value} {s.label}
                        </span>
                    ))}
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                        <List className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                        <Grid3x3 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50 shrink-0 overflow-x-auto">
                {/* Tabs */}
                <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg shrink-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {tab.label}
                            <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded-full ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search tickets..."
                        className="pl-8 h-7 text-[11px] bg-gray-50 border-gray-200 rounded-lg focus:bg-white"
                    />
                </div>

                {/* Priority filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={`h-7 gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${priorityFilter !== "all" ? "border-blue-300 text-blue-600 bg-blue-50" : ""}`}>
                            <Filter className="w-3 h-3" />
                            {priorityFilter === "all" ? "Priority" : priorityFilter}
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {["all", "urgent", "high", "medium", "low"].map(p => (
                            <DropdownMenuItem key={p} onClick={() => setPriorityFilter(p)} className={`text-[11px] font-bold gap-2 ${priorityFilter === p ? "text-blue-600 bg-blue-50" : ""}`}>
                                {p !== "all" && <span className={`w-2 h-2 rounded-full ${p === "urgent" ? "bg-red-500" : p === "high" ? "bg-orange-500" : p === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />}
                                {p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}
                                {priorityFilter === p && <CheckCircle className="w-3 h-3 ml-auto" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* ── Main Content ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Ticket List */}
                <div className={`flex flex-col overflow-hidden transition-all duration-300 bg-white ${selectedTicket ? "w-[42%] border-r border-gray-200" : "flex-1"}`}>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <Inbox className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-sm font-bold text-gray-400 mb-1">No tickets found</p>
                            <p className="text-xs text-gray-300">
                                {searchQuery ? "Try a different search" : `The ${activeTab} queue is empty`}
                            </p>
                            {(searchQuery || activeTab !== "all") && (
                                <button onClick={() => { setSearchQuery(""); setActiveTab("all"); }} className="mt-3 text-[11px] font-bold text-blue-500 hover:underline">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : viewMode === "list" ? (
                        <div className="flex-1 overflow-y-auto">
                            {filtered.map((ticket, i) => (
                                <TicketRow
                                    key={ticket.id || ticket.ticketId || i}
                                    ticket={ticket}
                                    onView={setSelectedTicket}
                                    isSelected={selectedTicket?.id === ticket.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
                                {filtered.map((ticket, i) => (
                                    <TicketCard
                                        key={ticket.id || ticket.ticketId || i}
                                        ticket={ticket}
                                        onView={setSelectedTicket}
                                        isSelected={selectedTicket?.id === ticket.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selectedTicket && (
                    <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f8fa]">
                        <TicketPanel
                            ticketId={selectedTicket.id}
                            onClose={() => setSelectedTicket(null)}
                        />
                    </div>
                )}

                {/* Empty state when no ticket selected */}
                {!selectedTicket && filtered.length > 0 && (
                    <div className="hidden lg:flex flex-col items-center justify-center text-center p-8 border-l border-gray-200 w-80 bg-gray-50">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Select a ticket</p>
                        <p className="text-xs text-gray-400">Click any ticket to view the conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
