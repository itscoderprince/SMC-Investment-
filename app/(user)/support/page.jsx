"use client";

import * as React from "react";
import { useState } from "react";
import {
    MessageSquare, Plus, ChevronDown, X, Clock,
    CheckCircle, AlertCircle, User, Send, HelpCircle,
    Home, Loader2, MessageCircle, ChevronRight, Inbox,
    RefreshCcw, Tag
} from "lucide-react";

import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTickets, useTicket } from "@/hooks/useApi";
import { ticketsApi } from "@/lib/api";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
    { value: "payment", label: "Payment Issues" },
    { value: "kyc", label: "KYC Verification" },
    { value: "withdrawal", label: "Withdrawal Problems" },
    { value: "investment", label: "Investment Queries" },
    { value: "account", label: "Account Issues" },
    { value: "technical", label: "Technical Issues" },
    { value: "other", label: "Other" },
];

const STATUS = {
    open: { label: "Open", cls: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    "in-progress": { label: "In Progress", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    waiting: { label: "Waiting", cls: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    resolved: { label: "Resolved", cls: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
    closed: { label: "Closed", cls: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

const TABS = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "active", label: "Active" },
    { id: "closed", label: "Closed" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relTime(d) {
    if (!d) return "—";
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const date = new Date(d);
    return `${date.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()]}`;
}

function StatusBadge({ status }) {
    const cfg = STATUS[status] || STATUS.open;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ─── Conversation Panel ───────────────────────────────────────────────────────

function ConversationPanel({ ticketId, onClose }) {
    const { ticket, loading, reply } = useTicket(ticketId);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            await reply(text);
            setText("");
            toast.success("Message sent");
        } catch (e) {
            toast.error("Failed to send");
        } finally {
            setSending(false);
        }
    };

    if (loading && !ticket) return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
    );

    if (!ticket) return null;

    const catLabel = CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-medium">#{ticket.ticketId?.slice(-6) || ticket.id?.slice(-6)}</span>
                        <StatusBadge status={ticket.status} />
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{catLabel}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{ticket.subject}</p>
                </div>
                <button onClick={onClose} className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f7f8fa]">
                {/* Initial message */}
                <div className="flex gap-2.5 max-w-[90%]">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold text-gray-500">You</span>
                            <span className="text-[10px] text-gray-400">{relTime(ticket.createdAt)}</span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-3 py-2 shadow-sm">
                            <p className="text-[13px] text-gray-700 leading-relaxed">{ticket.description}</p>
                        </div>
                    </div>
                </div>

                {/* Thread messages */}
                {(ticket.messages || []).map((msg, i) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                        <div key={msg._id || i} className={`flex gap-2.5 ${isAdmin ? "" : "flex-row-reverse"} max-w-[90%] ${isAdmin ? "" : "ml-auto"}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isAdmin ? "bg-blue-600" : "bg-gray-200"}`}>
                                {isAdmin
                                    ? <MessageCircle className="w-3.5 h-3.5 text-white" />
                                    : <User className="w-3.5 h-3.5 text-gray-500" />
                                }
                            </div>
                            <div className={isAdmin ? "" : "items-end flex flex-col"}>
                                <div className={`flex items-center gap-2 mb-1 ${isAdmin ? "" : "flex-row-reverse"}`}>
                                    <span className={`text-[10px] font-semibold ${isAdmin ? "text-blue-600" : "text-gray-500"}`}>
                                        {isAdmin ? (msg.senderName || "Support") : "You"}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{relTime(msg.timestamp)}</span>
                                </div>
                                <div className={`rounded-xl px-3 py-2 shadow-sm ${isAdmin
                                    ? "bg-blue-600 text-white rounded-tl-sm"
                                    : "bg-white border border-gray-200 text-gray-700 rounded-tr-sm"
                                    }`}>
                                    <p className="text-[13px] leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Awaiting response indicator */}
                {ticket.status === "open" && !(ticket.messages?.length) && (
                    <div className="flex gap-2.5 max-w-[90%]">
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div className="bg-amber-50 border border-amber-200 border-dashed rounded-xl rounded-tl-sm px-3 py-2">
                            <p className="text-[12px] font-medium text-amber-700">Awaiting response — typically within 4 hours</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Reply / Closed footer */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                {ticket.status !== "closed" ? (
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                            placeholder="Add a follow-up message..."
                            rows={2}
                            className="flex-1 resize-none text-[13px] px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none transition-all placeholder:text-gray-400"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!text.trim() || sending}
                            className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shrink-0"
                        >
                            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-dashed border-gray-200">
                        <p className="text-[12px] text-gray-400">This ticket is closed</p>
                        <span className="text-[11px] text-gray-400">Create a new ticket if you need more help</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── New Ticket Form ──────────────────────────────────────────────────────────

function NewTicketForm({ onClose, onSuccess }) {
    const [form, setForm] = useState({ subject: "", category: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    const valid = form.subject.trim().length >= 5 && form.category && form.description.trim().length >= 20;

    const handleSubmit = async () => {
        if (!valid) return;
        setSubmitting(true);
        try {
            await ticketsApi.create(form);
            toast.success("Ticket submitted — we'll respond shortly");
            onSuccess();
        } catch (e) {
            toast.error(e.message || "Failed to create ticket");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Form Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-[13px] font-semibold text-gray-800">New Support Ticket</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#f7f8fa] space-y-3">
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Subject <span className="text-red-400">*</span></label>
                    <Input
                        value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="Brief summary of your issue..."
                        className="h-9 text-[13px] bg-white border-gray-200 rounded-lg focus:border-blue-400"
                    />
                    {form.subject.length > 0 && form.subject.length < 5 && (
                        <p className="text-[10px] text-amber-500 mt-1">Minimum 5 characters</p>
                    )}
                </div>

                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Category <span className="text-red-400">*</span></label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                        <SelectTrigger className="h-9 text-[13px] bg-white border-gray-200 rounded-lg">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value} className="text-[13px]">{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-gray-500">Description <span className="text-red-400">*</span></label>
                        <span className={`text-[10px] ${form.description.length < 20 && form.description.length > 0 ? "text-amber-500" : "text-gray-400"}`}>
                            {form.description.length < 20 ? `${20 - form.description.length} more chars needed` : `${form.description.length}/500`}
                        </span>
                    </div>
                    <textarea
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Describe your issue in detail — the more context, the faster we can help..."
                        rows={5}
                        maxLength={500}
                        className="w-full resize-none text-[13px] px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                {/* Info strip */}
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <p className="text-[11px] text-blue-600">Typical response time: <strong>under 4 hours</strong> during business hours</p>
                </div>
            </div>

            {/* Form Footer */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                <button onClick={onClose} className="text-[12px] text-gray-400 hover:text-gray-600 font-medium transition-colors">
                    Cancel
                </button>
                <Button
                    onClick={handleSubmit}
                    disabled={!valid || submitting}
                    className="h-8 px-5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg shadow-sm"
                >
                    {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Submitting</> : <><Send className="w-3.5 h-3.5 mr-1.5" />Submit Ticket</>}
                </Button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupportPage() {
    const { tickets, loading, refetch } = useTickets();
    const [activeTab, setActiveTab] = useState("all");
    const [selected, setSelected] = useState(null); // ticket object
    const [showForm, setShowForm] = useState(false);

    const filtered = (tickets || []).filter(t => {
        if (!t) return false;
        if (activeTab === "all") return true;
        if (activeTab === "open") return t.status === "open";
        if (activeTab === "active") return t.status === "in-progress" || t.status === "waiting";
        if (activeTab === "closed") return t.status === "closed" || t.status === "resolved";
        return true;
    });

    const handleFormSuccess = () => {
        setShowForm(false);
        setSelected(null);
        refetch();
    };

    const rightPanelOpen = showForm || !!selected;

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="flex flex-col overflow-hidden -mx-2 md:-mx-4 lg:-mx-6 -mt-2 md:-mt-4 lg:-mt-6" style={{ height: 'calc(100vh - 3.5rem)' }}>

            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard" className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1">
                                <Home className="w-3 h-3" /> Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> Support Center
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Button
                    onClick={() => { setShowForm(true); setSelected(null); }}
                    size="sm"
                    className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg gap-1.5 shadow-sm"
                >
                    <Plus className="w-3.5 h-3.5" /> New Ticket
                </Button>
            </div>

            {/* ── Filter Bar ── */}
            <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${activeTab === tab.id ? "bg-white shadow-sm text-blue-600 border border-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-white/60"}`}
                    >
                        {tab.label}
                        <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded-full ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                            {tab.id === "all" ? (tickets || []).length
                                : tab.id === "open" ? (tickets || []).filter(t => t.status === "open").length
                                    : tab.id === "active" ? (tickets || []).filter(t => t.status === "in-progress" || t.status === "waiting").length
                                        : (tickets || []).filter(t => t.status === "closed" || t.status === "resolved").length}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Main Content ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Ticket List */}
                <div className={`flex flex-col overflow-hidden bg-white transition-all duration-300 ${rightPanelOpen ? "w-[40%] border-r border-gray-200" : "flex-1"}`}>
                    {filtered.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                                <Inbox className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">No tickets yet</p>
                            <p className="text-xs text-gray-400 mb-4">Create a ticket and we'll get back to you</p>
                            <Button onClick={() => setShowForm(true)} size="sm" className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[12px] rounded-lg">
                                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Ticket
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                            {filtered.map((ticket, i) => {
                                const isSelected = selected?.id === ticket.id;
                                const catLabel = CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category;
                                return (
                                    <div
                                        key={ticket.id || i}
                                        onClick={() => { setSelected(ticket); setShowForm(false); }}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-blue-50/40 group border-l-2 ${isSelected ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"}`}
                                    >
                                        {/* Status dot */}
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS[ticket.status]?.dot || "bg-gray-400"}`} />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[13px] font-medium truncate mb-0.5 transition-colors ${isSelected ? "text-blue-700" : "text-gray-800 group-hover:text-blue-700"}`}>
                                                {ticket.subject}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-400">{catLabel}</span>
                                                <span className="text-gray-200">·</span>
                                                <span className="text-[10px] text-gray-400">{relTime(ticket.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Right */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <StatusBadge status={ticket.status} />
                                            <ChevronRight className={`w-3.5 h-3.5 transition-colors ${isSelected ? "text-blue-400" : "text-gray-300 group-hover:text-blue-400"}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Info strip at bottom */}
                    <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-2.5 grid grid-cols-3 gap-2">
                        {[
                            { icon: Clock, text: "9AM–6PM Mon–Sat" },
                            { icon: MessageSquare, text: "~4h response" },
                            { icon: AlertCircle, text: "Urgent: 30–60m" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <item.icon className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-[10px] text-gray-400 truncate">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel — Conversation or Form */}
                {rightPanelOpen && (
                    <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f8fa]">
                        {showForm ? (
                            <NewTicketForm onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
                        ) : selected ? (
                            <ConversationPanel ticketId={selected.id} onClose={() => setSelected(null)} />
                        ) : null}
                    </div>
                )}

                {/* Empty right panel placeholder */}
                {!rightPanelOpen && filtered.length > 0 && (
                    <div className="hidden lg:flex flex-col items-center justify-center text-center p-8 border-l border-gray-200 w-72 bg-gray-50">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Select a ticket</p>
                        <p className="text-xs text-gray-400">Click any ticket to view the conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
