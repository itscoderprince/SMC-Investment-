"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useAdminDashboard } from "@/hooks/useApi";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";

export default function AdminLayout({ children }) {
    const { user: authUser, logout: logoutAction } = useAuthStore();
    const router = useRouter();
    const { data: dashboardData } = useAdminDashboard();
    const [mounted, setMounted] = React.useState(false);

    const handleLogout = async () => {
        await logoutAction();
        router.push("/");
    };

    const pending = dashboardData?.pending || {};
    const notificationCount = (pending.kyc || 0) + (pending.payments || 0) + (pending.withdrawals || 0) + (pending.tickets || 0);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#0f172a] px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 flex-1">
                        <SidebarTrigger className="-ml-1 text-gray-400 hover:bg-white/10 hover:text-white" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center flex-1 max-w-md">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search users, investments..."
                                    className="w-full h-9 pl-10 pr-4 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 focus:border-[#2563eb] focus:bg-white/10 focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Notifications + User */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Bell className="w-5 h-5 text-gray-400" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        {mounted ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center text-white text-sm font-bold uppercase">
                                            {authUser?.name?.charAt(0) || 'A'}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-white">
                                            {authUser?.name?.split(' ')[0] || 'Admin'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Authenticated as</p>
                                        <p className="text-sm font-black text-gray-900 truncate">{authUser?.name || 'Admin'}</p>
                                        <Badge variant="outline" className="mt-2 h-5 bg-blue-50 text-blue-600 border-blue-100 text-[9px] uppercase font-black tracking-tighter">
                                            {authUser?.role?.replace('_', ' ') || 'admin'}
                                        </Badge>
                                    </div>

                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    >
                                        <LogOut className="mr-2 w-4 h-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2 p-2 rounded-lg grayscale opacity-50">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center text-white text-sm font-bold uppercase">
                                    A
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-white">
                                    Admin
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 bg-[#f9fafb] min-h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
