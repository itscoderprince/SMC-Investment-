"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    BadgePercent,
    Wallet,
    Save,
    RefreshCcw,
    ShieldCheck,
    Copy,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        usdt_bep20_address: "",
        usdt_trc20_address: ""
    });
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getSettings('payment');
            if (data && data.settings) {
                setSettings({
                    usdt_bep20_address: data.settings.usdt_bep20_address || "",
                    usdt_trc20_address: data.settings.usdt_trc20_address || ""
                });
            }
        } catch (error) {
            toast.error("Failed to load settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await adminApi.updateSettings('payment', settings);
            toast.success("Payment addresses updated successfully");
        } catch (error) {
            toast.error(error.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payment Gateways</h1>
                    <p className="text-xs font-medium text-gray-500 mt-1">Manage network addresses for accepting USDT deposits.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSettings}
                    className="h-9 font-bold text-[11px] gap-2"
                >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Refresh
                </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* BEP20 Card */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <Badge className="bg-yellow-400 text-blue-900 font-black border-none text-[9px]">BEP20</Badge>
                            </div>
                            <CardTitle className="text-lg font-black mt-4">Binance Smart Chain</CardTitle>
                            <CardDescription className="text-blue-100 text-[11px] font-medium leading-relaxed">
                                Used for USDT transfers via BSC network. Ensure the address is accurate to avoid loss of funds.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant Wallet Address</Label>
                                <div className="relative">
                                    <Input
                                        value={settings.usdt_bep20_address}
                                        onChange={(e) => setSettings({ ...settings, usdt_bep20_address: e.target.value })}
                                        className="font-mono text-[11px] h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all pr-10"
                                        placeholder="0x..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(settings.usdt_bep20_address, 'bep20')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {copied === 'bep20' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TRC20 Card */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-5">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <Badge className="bg-white text-red-600 font-black border-none text-[9px]">TRC20</Badge>
                            </div>
                            <CardTitle className="text-lg font-black mt-4">Tron Network</CardTitle>
                            <CardDescription className="text-red-100 text-[11px] font-medium leading-relaxed">
                                Used for USDT transfers via TRON network. TRC20 is widely preferred for lower transaction fees.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant Wallet Address</Label>
                                <div className="relative">
                                    <Input
                                        value={settings.usdt_trc20_address}
                                        onChange={(e) => setSettings({ ...settings, usdt_trc20_address: e.target.value })}
                                        className="font-mono text-[11px] h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all pr-10"
                                        placeholder="T..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(settings.usdt_trc20_address, 'trc20')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        {copied === 'trc20' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-sm bg-blue-50/50 border border-blue-100 overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                                <BadgePercent className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-blue-900 leading-tight">Security Protocol Active</p>
                                <p className="text-[10px] text-blue-700 font-medium">Changes here affect the main payment portal for all users.</p>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-xs font-black px-6 h-11"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
