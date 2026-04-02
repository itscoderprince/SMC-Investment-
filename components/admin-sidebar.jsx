"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    FileCheck,
    CreditCard,
    Wallet,
    TrendingUp,
    Database,
    Calculator,
    MessageSquare,
    Settings,
    LogOut,
    ChevronRight,
    ChevronsUpDown,
    AlertCircle,
    Gift,
} from "lucide-react"


import { useAuthStore } from "@/store/authStore"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    useAdminDashboard
} from "@/hooks/useApi"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"


export function AdminSidebar({ ...props }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user: authUser, logout: logoutAction } = useAuthStore()
    const [mounted, setMounted] = React.useState(false)
    const { data: dashboardData, loading: dashboardLoading } = useAdminDashboard()

    const handleLogout = async () => {
        await logoutAction()
        router.push("/")
    }

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const pending = dashboardData?.pending || {}

    // Navigation data
    const navData = {
        main: [
            {
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard
            },
            {
                title: "Users",
                url: "/admin/users",
                icon: Users
            },
            {
                title: "Referral Program",
                url: "/admin/referrals",
                icon: Gift
            },
        ],

        requests: [
            {
                title: "KYC Requests",
                url: "/admin/kyc",
                icon: FileCheck,
                badge: pending.kyc > 0 ? pending.kyc.toString() : null,
                badgeColor: "bg-orange-600"
            },
            {
                title: "Payment Requests",
                url: "/admin/payments",
                icon: CreditCard,
                badge: pending.payments > 0 ? pending.payments.toString() : null,
                badgeColor: "bg-blue-600"
            },
            {
                title: "Withdrawals",
                url: "/admin/withdrawals",
                icon: Wallet,
                badge: pending.withdrawals > 0 ? pending.withdrawals.toString() : null,
                badgeColor: "bg-purple-600"
            },
        ],
        investments: [
            {
                title: "Investments",
                url: "/admin/investments",
                icon: TrendingUp
            },
            {
                title: "Indices",
                url: "/admin/indices",
                icon: Database
            },
            {
                title: "Returns",
                url: "/admin/returns",
                icon: Calculator
            },
        ],
        support: [
            {
                title: "Support Tickets",
                url: "/admin/tickets",
                icon: MessageSquare,
                badge: pending.tickets > 0 ? pending.tickets.toString() : null,
                badgeColor: "bg-slate-600"
            },
            {
                title: "Payment Settings",
                url: "/admin/settings/payment",
                icon: Settings
            },
        ],
    };

    return (
        <Sidebar collapsible="icon" className="bg-[#0f172a] border-r-0" {...props}>
            <SidebarHeader className="bg-[#0f172a] border-b border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-white/5 data-[state=open]:text-white hover:bg-white/5 hover:text-white"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white">
                                <LayoutDashboard className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-white">SMC</span>
                                <span className="truncate text-xs text-gray-400">Admin Panel</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-[#0f172a]">
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider">
                        Overview
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.main.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "hover:bg-white/5 hover:text-white transition-all",
                                                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Requests */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider">
                        Requests
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.requests.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "hover:bg-white/5 hover:text-white transition-all",
                                                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        {item.badge && (
                                            <SidebarMenuBadge className={`${item.badgeColor} text-white text-[10px] font-bold`}>
                                                {item.badge}
                                            </SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Investments */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider">
                        Investments
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.investments.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "hover:bg-white/5 hover:text-white transition-all",
                                                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Support */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider">
                        Support
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.support.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={cn(
                                                "hover:bg-white/5 hover:text-white transition-all",
                                                isActive ? "bg-blue-600 !text-white shadow-lg shadow-blue-500/20" : "text-gray-400"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        {item.badge && (
                                            <SidebarMenuBadge className={`${item.badgeColor} text-white text-[10px] font-bold`}>
                                                {item.badge}
                                            </SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-[#0f172a] border-t border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {mounted ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-white/5 data-[state=open]:text-white hover:bg-white/5 hover:text-white"
                                    >
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] text-white text-sm font-bold uppercase">
                                            {authUser?.name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold text-white">{authUser?.name || 'Admin'}</span>
                                            <span className="truncate text-xs text-gray-400 capitalize">{authUser?.role?.replace('_', ' ') || 'admin'}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SidebarMenuButton size="lg" className="hover:bg-white/5 hover:text-white">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] text-white text-sm font-bold">
                                    A
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-white">Admin</span>
                                    <span className="truncate text-xs text-gray-400">admin@smc.com</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
