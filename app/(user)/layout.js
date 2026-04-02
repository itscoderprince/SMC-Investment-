"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Bell,
    ChevronDown,
    Settings,
    LogOut,
    User as UserIcon,
    Search,
    TrendingUp,
    Headset,
    Home,
    PlusCircle,
    Wallet,
    LayoutDashboard,
} from "lucide-react";

import { UserSidebar } from "@/components/user-sidebar";
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

const mobileNavItems = [
    { name: "Home", href: "/dashboard", icon: Home, color: "text-blue-500", bg: "bg-blue-50", active: "bg-blue-600 shadow-blue-500/30" },
    { name: "Portfolio", href: "/investments", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", active: "bg-emerald-600 shadow-emerald-500/30" },
    { name: "Invest", href: "/invest", icon: PlusCircle, color: "text-indigo-500", bg: "bg-indigo-50", active: "bg-indigo-600 shadow-indigo-500/30" },
    { name: "Withdraw", href: "/withdraw", icon: Wallet, color: "text-orange-500", bg: "bg-orange-50", active: "bg-orange-600 shadow-orange-500/30" },
    { name: "Profile", href: "/kyc", icon: UserIcon, color: "text-rose-500", bg: "bg-rose-50", active: "bg-rose-600 shadow-rose-500/30" },
];

export default function UserLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout: logoutAction, refreshUser } = useAuthStore();
    const [notificationCount] = useState(3);
    const [mounted, setMounted] = useState(false);

    const handleLogout = async () => {
        await logoutAction();
        router.push("/");
    };

    useEffect(() => {
        setMounted(true);
        refreshUser().catch(console.error);
    }, [refreshUser]);

    return (
        <SidebarProvider>
            <UserSidebar />
            <SidebarInset>
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 md:px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 flex-1">
                        <SidebarTrigger className="-ml-1 text-gray-500 hover:bg-gray-100" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                    </div>

                    {/* Right side: Support + Notifications + User */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search on Desktop */}
                        <div className="hidden lg:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="h-9 w-64 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:w-80 outline-none transition-all duration-300"
                            />
                        </div>

                        {/* Quick Actions Separator */}
                        <div className="h-6 w-px bg-gray-200 mx-1 hidden lg:block" />

                        {/* Support Icon */}
                        <Link href="/support" className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-all group">
                            <Headset className="w-5 h-5" />
                        </Link>

                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                            <Bell className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />

                        {/* User Menu */}
                        {mounted ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm uppercase">
                                            {user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div className="hidden sm:flex flex-col items-start leading-none gap-1">
                                            <span className="text-xs font-black text-gray-900 tracking-tight">{user?.name || "User"}</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                                    user?.kycStatus === 'approved' ? "bg-green-500" :
                                                        user?.kycStatus === 'rejected' ? "bg-red-500" : "bg-orange-500"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest leading-none",
                                                    user?.kycStatus === 'approved' ? "text-green-600" :
                                                        user?.kycStatus === 'rejected' ? "text-red-600" : "text-orange-600"
                                                )}>
                                                    {user?.kycStatus === 'approved' ? 'Verified' : user?.kycStatus === 'rejected' ? 'Rejected' : 'Not Verified'}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-1 overflow-hidden rounded-xl border-gray-200 shadow-xl">
                                    <div className="px-3 py-3 bg-gray-50/50 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                        <p className="text-[10px] text-gray-500 truncate font-medium">{user?.email}</p>
                                    </div>
                                    <div className="p-1.5">
                                        <DropdownMenuItem asChild className="rounded-lg">
                                            <Link href="/kyc" className="cursor-pointer flex items-center">
                                                <UserIcon className="mr-2 w-4 h-4 text-gray-500" />
                                                My Profile
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-gray-100" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg flex items-center font-bold"
                                        >
                                            <LogOut className="mr-2 w-4 h-4" />
                                            Sign out
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2 p-1.5 rounded-lg opacity-50 grayscale">
                                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-2 md:p-4 lg:p-6 bg-[#f8fafc] min-h-[calc(100vh-3.5rem)] pb-24 md:pb-6">
                    {children}
                </main>

                {/* Mobile Bottom Navigation (Docs Style) */}
                <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-4">
                    <nav className="flex items-center justify-between bg-white/95 backdrop-blur-xl border border-gray-100/50 rounded-2xl h-16 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-2">
                        {mobileNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex flex-col items-center justify-center flex-1 transition-all relative"
                                >
                                    <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? `${item.active} text-white shadow-lg -translate-y-2` : `${item.color} ${item.bg}/40 hover:scale-110`}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-black mt-1 transition-all duration-300 ${isActive ? "text-gray-900 opacity-100 scale-100" : "text-gray-400 opacity-70 scale-100 translate-y-0"}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
