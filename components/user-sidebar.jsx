"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    TrendingUp,
    PlusCircle,
    Wallet,
    MessageSquare,
    User,
    LogOut,
    Settings,
    ChevronRight,
    ChevronsUpDown,
    ShieldCheck,
    Gift,
} from "lucide-react"


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
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/authStore"

// Navigation data
const navData = {
    main: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard
        },
        {
            title: "My Investments",
            url: "/investments",
            icon: TrendingUp
        },
    ],
    finance: [
        {
            title: "Invest Now",
            url: "/invest",
            icon: PlusCircle,
        },
        {
            title: "Withdraw Funds",
            url: "/withdraw",
            icon: Wallet,
        },
    ],
    account: [
        {
            title: "Profile & KYC",
            url: "/kyc",
            icon: User,
        },
        {
            title: "Support Tickets",
            url: "/support",
            icon: MessageSquare
        },
        {
            title: "Referrals",
            url: "/referrals",
            icon: Gift
        },
    ],
}


export function UserSidebar({ ...props }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout: logoutAction } = useAuthStore()
    const [mounted, setMounted] = React.useState(false)

    const handleLogout = async () => {
        await logoutAction()
        router.push("/")
    }

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <Sidebar collapsible="icon" className="bg-[#0f172a] border-r-0" {...props}>
            <SidebarHeader className="bg-[#0f172a] border-b border-white/10 h-14 flex items-center justify-center py-0 px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-white/5 data-[state=open]:text-white hover:bg-white/5 hover:text-white"
                        >
                            <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white">
                                <TrendingUp className="size-3.5" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-black text-white tracking-tight">SMC</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                    <span className="truncate text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">User Terminal</span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-[#0f172a]">
                {/* Overview */}
                <SidebarGroup className="py-2">
                    <SidebarGroupLabel className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-1">
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
                                                "h-10 hover:bg-white/5 hover:text-white transition-all text-sm",
                                                isActive ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/20" : "text-gray-400"
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

                {/* Finance */}
                <SidebarGroup className="py-2">
                    <SidebarGroupLabel className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-1">
                        Finance
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.finance.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "h-10 hover:bg-white/5 hover:text-white transition-all text-sm",
                                                isActive ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/20" : "text-gray-400"
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

                {/* Account & Support */}
                <SidebarGroup className="py-2">
                    <SidebarGroupLabel className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-1">
                        Account
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.account.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={cn(
                                                "h-10 hover:bg-white/5 hover:text-white transition-all text-sm",
                                                isActive ? "bg-[#2563eb] !text-white shadow-lg shadow-blue-500/20" : "text-gray-400"
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
            </SidebarContent>

            <SidebarFooter className="bg-[#0f172a] border-t border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {mounted ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="h-12 data-[state=open]:bg-white/5 data-[state=open]:text-white hover:bg-white/5 hover:text-white"
                                    >
                                        <div className="flex aspect-square size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white text-xs font-bold uppercase">
                                            {user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold text-white">{user?.name || "User"}</span>
                                            <span className={cn(
                                                "truncate text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider",
                                                user?.kycStatus === 'approved' ? "text-green-500" :
                                                    user?.kycStatus === 'rejected' ? "text-red-500" : "text-orange-500"
                                            )}>
                                                <div className={cn(
                                                    "w-1 h-1 rounded-full",
                                                    user?.kycStatus === 'approved' ? "bg-green-500" :
                                                        user?.kycStatus === 'rejected' ? "bg-red-500" : "bg-orange-500"
                                                )} />
                                                {user?.kycStatus === 'approved' ? 'Verified' : user?.kycStatus === 'rejected' ? 'Rejected' : 'Not Verified'}
                                            </span>
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
                                    <DropdownMenuItem asChild>
                                        <Link href="/kyc" className="cursor-pointer">
                                            <User className="mr-2 size-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>

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
                                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] text-white text-sm font-bold uppercase">
                                    U
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-white">Guest</span>
                                    <span className="truncate text-xs text-gray-400">Loading profile...</span>
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
