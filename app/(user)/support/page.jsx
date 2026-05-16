"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
    Search, MessageSquare, Clock, CheckCircle, X, Send,
    Plus, HelpCircle, Inbox, ChevronRight, Activity, 
    ArrowDownCircle, TrendingUp, User, CreditCard, ShieldCheck,
    List, Grid3x3, Home, Loader2, CheckCircle2,
    Filter, ChevronDown
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { useTickets, useTicket } from "@/hooks/useApi";
import { ticketsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = {
    payment: { label: "Payment", color: "bg-blue-100 text-blue-700", icon: CreditCard },
    kyc: { label: "KYC", color: "bg-purple-100 text-purple-700", icon: ShieldCheck },
    withdrawal: { label: "Withdrawal", color: "bg-orange-100 text-orange-700", icon: ArrowDownCircle },
    investment: { label: "Investment", color: "bg-green-100 text-green-700", icon: TrendingUp },
    account: { label: "Account", color: "bg-gray-100 text-gray-700", icon: User },
    other: { label: "Other", color: "bg-gray-100 text-gray-600", icon: HelpCircle },
};

const CATEGORIES_LIST = [
    { value: "payment", label: "Payment Issues" },
    { value: "kyc", label: "KYC Verification" },
    { value: "withdrawal", label: "Withdrawal Problems" },
    { value: "investment", label: "Investment Queries" },
    { value: "account", label: "Account Issues" },
    { value: "technical", label: "Technical Issues" },
    { value: "other", label: "Other" },
];

const STATUS_CONFIG = {
    open: { label: "Open", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    "in-progress": { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    waiting: { label: "Waiting", cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    resolved: { label: "Resolved", cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
    closed: { label: "Closed", cls: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtShort(d) {
    if (!d) return "—";
    const date = new Date(d);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
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

// ─── Ticket Row (List View) ───────────────────────────────────────────────────

function TicketRow({ ticket, onView, isSelected }) {
    const cat = CATEGORIES[ticket.category] || CATEGORIES.other;
    const CatIcon = cat.icon;
    return (
        <div
            onClick={() => onView(ticket)}
            className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50/40 group ${isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent"}`}
        >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                <CatIcon className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-black text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                        {ticket.subject}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-widest">
                        #{ticket.ticketId?.slice(-6) || ticket.id?.slice(-6)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={ticket.status} />
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
            <div className="px-3 pb-3 pt-1">
                <p className="text-[12px] font-black text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {ticket.subject}
                </p>
                <p className="text-[9px] text-gray-400 mt-2">{fmtShort(ticket.createdAt)}</p>
            </div>
        </div>
    );
}

// ─── New Ticket Form ──────────────────────────────────────────────────────────

function NewTicketPanel({ onClose, onSuccess }) {
    const [form, setForm] = useState({ subject: "", category: "", description: "", priority: "medium" });
    const [submitting, setSubmitting] = useState(false);

    const valid = form.subject.trim().length >= 5 && form.category && form.description.trim().length >= 20;

    const handleSubmit = async () => {
        if (!valid) return;
        setSubmitting(true);
        try {
            await ticketsApi.create(form);
            toast.success("Ticket submitted successfully.");
            onSuccess();
        } catch (e) {
            toast.error(e.message || "Failed to create ticket");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <Plus className="w-4 h-4" />
                    </div>
                    <p className="text-[12px] font-semibold text-gray-800">Open New Ticket</p>
                </div>
                <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f7f8fa]">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Subject <span className="text-red-500">*</span></label>
                        <Input
                            value={form.subject}
                            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                            placeholder="Briefly summarize your request"
                            className="h-9 text-[12px] bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Category <span className="text-red-500">*</span></label>
                            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                                <SelectTrigger className="h-9 text-[12px] bg-gray-50 focus:bg-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES_LIST.map(c => (
                                        <SelectItem key={c.value} value={c.value} className="text-[12px] font-medium">{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Priority</label>
                            <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                                <SelectTrigger className="h-9 text-[12px] bg-gray-50 focus:bg-white">
                                    <SelectValue placeholder="Set priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        { val: "low", label: "Low", cls: "text-green-600" },
                                        { val: "medium", label: "Medium", cls: "text-yellow-600" },
                                        { val: "high", label: "High", cls: "text-orange-600" },
                                        { val: "urgent", label: "Urgent", cls: "text-red-600" }
                                    ].map(p => (
                                        <SelectItem key={p.val} value={p.val} className="text-[12px] font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${p.val === 'low' ? 'bg-green-500' : p.val === 'medium' ? 'bg-yellow-500' : p.val === 'high' ? 'bg-orange-500' : 'bg-red-500'}`} />
                                                {p.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Description <span className="text-red-500">*</span></label>
                            <span className={cn("text-[9px] font-bold tracking-widest uppercase", form.description.length < 20 && form.description.length > 0 ? "text-orange-500" : "text-gray-400")}>
                                {form.description.length < 20 ? `${20 - form.description.length} more chars` : `${form.description.length}/500`}
                            </span>
                        </div>
                        <Textarea
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Please provide comprehensive details..."
                            rows={6}
                            maxLength={500}
                            className="resize-none text-[12px] bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white p-3 flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose} className="h-8 text-[11px] font-bold">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!valid || submitting}
                    className="h-8 px-5 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold shadow-sm shadow-blue-500/20"
                >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                    Submit Request
                </Button>
            </div>
        </div>
    );
}

// ─── Ticket Detail Panel ──────────────────────────────────────────────────────

function ConversationPanel({ ticketId, onClose }) {
    const { ticket, loading, reply } = useTicket(ticketId);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const textareaRef = React.useRef(null);

    useEffect(() => {
        const target = textareaRef.current;
        if (target) {
            target.style.height = "auto";
            const nextHeight = Math.min(target.scrollHeight, 200);
            target.style.height = `${Math.max(36, nextHeight)}px`;
        }
    }, [replyText]);

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

    if (loading && !ticket) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!ticket) return null;

    const cat = CATEGORIES[ticket.category] || CATEGORIES.other;
    const CatIcon = cat.icon;

    return (
        <div className="flex flex-col h-full bg-white">
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
                <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={ticket.status} />
                    <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f7f8fa]">
                {/* Initial message */}
                <div className="flex flex-col items-end max-w-[88%] ml-auto">
                    <div className="flex items-center gap-1.5 mb-1 px-0.5 flex-row-reverse">
                        <span className="text-[10px] font-medium text-gray-500">You</span>
                        <span className="text-[9px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{fmtShort(ticket.createdAt)}</span>
                    </div>
                    <div className="bg-white border border-gray-200 text-gray-700 rounded-xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                </div>

                {/* Thread messages */}
                {(ticket.messages || []).map((msg, i) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                        <div key={msg._id || msg.id || i} className={`flex flex-col ${!isAdmin ? "items-end" : "items-start"} max-w-[88%] ${!isAdmin ? "ml-auto" : ""}`}>
                            <div className={`flex items-center gap-1.5 mb-1 px-0.5 ${!isAdmin ? "flex-row-reverse" : ""}`}>
                                <span className={`text-[10px] font-medium ${isAdmin ? "text-blue-600" : "text-gray-500"}`}>
                                    {isAdmin ? (msg.senderName || "Support") : "You"}
                                </span>
                                <span className="text-[9px] text-gray-300">·</span>
                                <span className="text-[10px] text-gray-400">{fmtShort(msg.timestamp)}</span>
                            </div>
                            <div className={`rounded-xl px-3.5 py-2.5 shadow-sm ${!isAdmin
                                ? "bg-white border border-gray-200 text-gray-700 rounded-tr-sm"
                                : "bg-blue-600 text-white rounded-tl-sm"
                                }`}>
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Awaiting response indicator */}
                {ticket.status === "open" && !(ticket.messages?.length) && (
                    <div className="flex flex-col items-start max-w-[88%] mt-4">
                        <div className="flex items-center gap-1.5 mb-1 px-0.5">
                            <span className="text-[10px] font-medium text-blue-600">System</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl rounded-tl-sm px-3.5 py-2.5 flex items-start gap-2 shadow-sm">
                            <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-[12px] font-medium text-blue-800 leading-relaxed">
                                Support will review this shortly — average response time is under 4 hours.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Reply Box */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                {ticket.status !== "closed" ? (
                    <div className="flex items-end gap-2">
                        <textarea
                            ref={textareaRef}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                            placeholder="Type a reply... (Ctrl+Enter to send)"
                            rows={1}
                            style={{ minHeight: '36px', maxHeight: '200px' }}
                            className="flex-1 resize-none text-[12px] px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none transition-all placeholder:text-gray-400 leading-relaxed overflow-y-auto"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!replyText.trim() || sending}
                            className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 shrink-0 mb-0.5"
                        >
                            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center bg-gray-50 rounded-xl px-3 py-4 border border-dashed border-gray-200 text-center">
                        <div>
                            <p className="text-[12px] font-bold text-gray-500 mb-0.5">Ticket is closed</p>
                            <p className="text-[10px] text-gray-400">Please open a new ticket for further assistance.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupportPage() {
    const { tickets, loading, refetch } = useTickets();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("list");
    const [mounted, setMounted] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const stats = {
        open: (tickets || []).filter(t => t.status === "open").length,
        inProgress: (tickets || []).filter(t => t.status === "in-progress").length,
        waiting: (tickets || []).filter(t => t.status === "waiting").length,
        resolved: (tickets || []).filter(t => t.status === "resolved").length,
        closed: (tickets || []).filter(t => t.status === "closed").length,
        total: (tickets || []).length,
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
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || t.subject?.toLowerCase().includes(q)
            || t.ticketId?.toLowerCase().includes(q);
        return matchTab && matchSearch;
    });

    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedTicket(null);
        refetch();
    };

    if (!mounted) return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="flex flex-col overflow-hidden -mx-2 md:-mx-4 lg:-mx-6 -mt-2 md:-mt-4 lg:-mt-6" style={{ height: 'calc(100vh - 3.5rem)' }}>
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard" className="text-[11px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-700 flex items-center gap-1">
                                    <Home className="w-3 h-3" /> Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[11px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" /> Support Tickets
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="hidden md:flex items-center gap-1.5">
                    {[
                        { label: "Open", value: stats.open, cls: "bg-blue-50 text-blue-700" },
                        { label: "Waiting", value: stats.waiting, cls: "bg-orange-50 text-orange-700" },
                        { label: "Resolved", value: stats.resolved, cls: "bg-green-50 text-green-700" },
                    ].map(s => (
                        <span key={s.label} className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.cls}`}>
                            {s.value} {s.label}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                        <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                            <List className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                            <Grid3x3 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    
                    <Button
                        onClick={() => { setShowForm(true); setSelectedTicket(null); }}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold shadow-sm shadow-blue-500/20"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Open New
                    </Button>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50 shrink-0 overflow-x-auto">
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

                <div className="relative flex-1 min-w-[160px] max-w-xs ml-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search your tickets..."
                        className="pl-8 h-7 text-[11px] bg-gray-50 border-gray-200 rounded-lg focus:bg-white"
                    />
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex flex-1 overflow-hidden bg-[#f7f8fa]">
                {/* Ticket List */}
                <div className={`flex flex-col overflow-hidden transition-all duration-300 bg-white ${selectedTicket || showForm ? "hidden lg:flex lg:w-[42%] border-r border-gray-200" : "flex-1"}`}>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <Inbox className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-sm font-bold text-gray-400 mb-1">No tickets found</p>
                            <p className="text-xs text-gray-300">
                                {searchQuery ? "Try a different search" : `You have no ${activeTab} tickets`}
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
                                    onView={(t) => { setSelectedTicket(t); setShowForm(false); }}
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
                                        onView={(t) => { setSelectedTicket(t); setShowForm(false); }}
                                        isSelected={selectedTicket?.id === ticket.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {(selectedTicket || showForm) && (
                    <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f8fa]">
                        {showForm ? (
                            <NewTicketPanel onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
                        ) : selectedTicket ? (
                            <ConversationPanel ticketId={selectedTicket.id} onClose={() => setSelectedTicket(null)} />
                        ) : null}
                    </div>
                )}

                {/* Empty state when no ticket selected */}
                {!selectedTicket && !showForm && filtered.length > 0 && (
                    <div className="hidden lg:flex flex-col items-center justify-center text-center p-8 border-l border-gray-200 w-80 bg-gray-50 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 shadow-sm border border-blue-100">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-600 mb-1">Select a ticket</p>
                        <p className="text-xs text-gray-400 max-w-[200px]">Click any ticket to view the conversation or open a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
