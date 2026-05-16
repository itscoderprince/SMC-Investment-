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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";

const mobileNavItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
    color: "text-blue-500",
    bg: "bg-blue-50",
    active: "bg-blue-600 shadow-blue-500/30",
  },
  {
    name: "Portfolio",
    href: "/investments",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    active: "bg-emerald-600 shadow-emerald-500/30",
  },
  {
    name: "Invest",
    href: "/invest",
    icon: PlusCircle,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    active: "bg-indigo-600 shadow-indigo-500/30",
  },
  {
    name: "Withdraw",
    href: "/withdraw",
    icon: Wallet,
    color: "text-orange-500",
    bg: "bg-orange-50",
    active: "bg-orange-600 shadow-orange-500/30",
  },
  {
    name: "Profile",
    href: "/kyc",
    icon: UserIcon,
    color: "text-rose-500",
    bg: "bg-rose-50",
    active: "bg-rose-600 shadow-rose-500/30",
  },
];

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutAction, refreshUser } = useAuthStore();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Investment Successful",
      message: "Your investment of $1,000 in Bratsk index was approved.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Identity Verified (KYC)",
      message: "Congratulations! Your identity documents have been approved.",
      time: "1 day ago",
      unread: true,
    },
    {
      id: 3,
      title: "Welcome to SMC Group",
      message: "Your secure account has been created successfully.",
      time: "2 days ago",
      unread: true,
    },
  ]);
  const [mounted, setMounted] = useState(false);

  const handleLogout = React.useCallback(async () => {
    await logoutAction();
    router.push("/");
  }, [logoutAction, router]);

  React.useEffect(() => {
    setMounted(true);
    refreshUser().catch(console.error);
  }, [refreshUser]);

  const { parent, current } = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return { parent: "Home", current: "" };

    const first = segments[0];
    if (first === "dashboard") {
      return { parent: "Home", current: "Dashboard" };
    } else if (first === "invest") {
      return { parent: "Home", current: "Invest Funds" };
    } else if (first === "withdraw") {
      return { parent: "Home", current: "Withdraw Funds" };
    } else if (first === "kyc") {
      return { parent: "Home", current: "Identity & KYC" };
    } else if (first === "investments") {
      return { parent: "Home", current: "Portfolio" };
    } else if (first === "support") {
      return { parent: "Home", current: "Support" };
    } else if (first === "referrals") {
      return { parent: "Home", current: "Referrals" };
    }

    return {
      parent: "Home",
      current: first.charAt(0).toUpperCase() + first.slice(1),
    };
  }, [pathname]);

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4 transition-all duration-200">
          <div className="flex items-center gap-2 flex-1">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:bg-muted" />
          </div>

          {/* Right side: Support + Notifications + User */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search on Desktop */}
            <div className="hidden lg:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search everything..."
                className="h-9 w-64 pl-9 pr-4 rounded-xl border border-input bg-muted/50 text-xs font-medium focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 focus:w-80 outline-none transition-all duration-300"
              />
            </div>

            {/* Quick Actions Separator */}
            <div className="h-6 w-px bg-border mx-1 hidden lg:block" />

            {/* Support Icon */}
            <Link
              href="/support"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors group outline-none"
            >
              <Headset className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </Link>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors outline-none select-none group">
                  <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {notifications.filter((n) => n.unread).length > 0 && (
                    <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[9px] font-black rounded-full border border-background flex items-center justify-center">
                      {notifications.filter((n) => n.unread).length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 p-0 rounded-2xl border border-border shadow-2xl bg-popover text-popover-foreground overflow-hidden mt-2"
              >
                <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">
                    Notifications
                  </h4>
                  {notifications.some((n) => n.unread) && (
                    <button
                      onClick={() =>
                        setNotifications(
                          notifications.map((n) => ({ ...n, unread: false })),
                        )
                      }
                      className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <ScrollArea className="h-72 w-full bg-popover">
                  <div className="p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground font-medium text-xs">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          className={cn(
                            "w-full p-3 rounded-xl transition-all border border-transparent hover:border-border cursor-pointer flex flex-col gap-1 text-left outline-none",
                            notification.unread
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "bg-transparent hover:bg-muted",
                          )}
                          onClick={() =>
                            setNotifications(
                              notifications.map((n) =>
                                n.id === notification.id
                                  ? { ...n, unread: false }
                                  : n,
                              ),
                            )
                          }
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span
                              className={cn(
                                "text-xs font-bold truncate",
                                notification.unread
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {notification.title}
                            </span>
                            <span className="text-[9px] font-semibold text-muted-foreground shrink-0">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                            {notification.message}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-border bg-muted/30 text-center">
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator
              orientation="vertical"
              className="mx-1 h-6 hidden sm:block"
            />

            {/* User Menu */}
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center p-1.5 outline-none select-none group transition-transform active:scale-95">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-xs font-black shadow-md uppercase ring-1 ring-border/50 transition-all group-hover:ring-primary/40">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-1 overflow-hidden rounded-xl border-border bg-popover text-popover-foreground shadow-xl"
                >
                  <div className="px-3 py-3 bg-muted/50 border-b border-border">
                    <p className="text-sm font-bold text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link
                        href="/kyc"
                        className="cursor-pointer flex items-center"
                      >
                        <UserIcon className="mr-2 w-4 h-4 text-muted-foreground" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg flex items-center font-bold"
                    >
                      <LogOut className="mr-2 w-4 h-4" />
                      Sign out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center p-1.5 opacity-50 grayscale">
                <div className="w-8 h-8 bg-muted rounded-full ring-1 ring-border" />
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-2 md:p-4 lg:p-6 bg-slate-50/50 min-h-[calc(100vh-3.5rem)] pb-24 md:pb-6">
          {!pathname.startsWith('/support') && (
            <div className="mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/dashboard"
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {parent}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {current && (
                    <>
                      <BreadcrumbSeparator className="scale-75 text-muted-foreground/50" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {current}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          {children}
        </main>

        {/* Mobile Bottom Navigation (Docs Style) */}
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-4">
          <nav className="flex items-center justify-between bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl h-16 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-2">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 transition-all relative"
                >
                  <div
                    className={`p-2 rounded-xl transition-all duration-300 ${isActive ? `bg-primary text-primary-foreground shadow-lg -translate-y-2` : `text-muted-foreground hover:bg-muted/50 hover:scale-110`}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-black mt-1 transition-all duration-300 ${isActive ? "text-foreground opacity-100 scale-100" : "text-muted-foreground opacity-70 scale-100 translate-y-0"}`}
                  >
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
