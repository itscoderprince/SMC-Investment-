"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  TrendingUp,
  ChevronRight,
  Shield,
  Activity,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";

/* ─── Premium Trading-style SMC Logo ─── */
const SMCLogo = ({ scrolled }) => (
  <div className="flex items-center gap-3 group select-none">
    {/* Icon mark — outer container */}
    <div className="relative flex h-11 w-11 items-center justify-center">
      {/* Animated spinning border ring */}
      <div
        className="absolute -inset-[2px] rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "conic-gradient(from 0deg, #3b82f6, #10b981, #6366f1, #3b82f6)",
          animation: "logoSpin 3s linear infinite",
        }}
      />
      {/* Ambient glow on hover */}
      <div className="absolute -inset-2 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/20 blur-xl transition-all duration-700 pointer-events-none" />

      {/* Main icon box */}
      <div className="relative h-full w-full rounded-xl overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/[0.12] group-hover:border-white/[0.2] transition-all duration-400 flex items-center justify-center z-10 shadow-lg shadow-blue-500/10">
        {/* Inner gradient sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-500/20" />

        {/* Animated mini candlestick bars */}
        <svg viewBox="0 0 32 32" className="relative w-6 h-6 z-10" aria-hidden="true">
          {/* Static candles — no SMIL animations (main-thread expensive) */}
          <rect x="5" y="10" width="3" height="10" rx="0.5" fill="#ef4444" opacity="0.9" />
          <line x1="6.5" y1="7" x2="6.5" y2="24" stroke="#ef4444" strokeWidth="1" opacity="0.5" />

          <rect x="11" y="6" width="3" height="14" rx="0.5" fill="#10b981" opacity="0.9" />
          <line x1="12.5" y1="3" x2="12.5" y2="24" stroke="#10b981" strokeWidth="1" opacity="0.5" />

          <rect x="17" y="8" width="3" height="12" rx="0.5" fill="#10b981" opacity="0.9" />
          <line x1="18.5" y1="4" x2="18.5" y2="24" stroke="#10b981" strokeWidth="1" opacity="0.5" />

          <rect x="23" y="4" width="3" height="16" rx="0.5" fill="#3b82f6" opacity="0.9" />
          <line x1="24.5" y1="2" x2="24.5" y2="24" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />

          <polyline
            points="4,22 10,16 16,18 27,5"
            fill="none"
            stroke="url(#logoArrowGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <polygon points="25,4 28,4 27,7" fill="#3b82f6" opacity="0.6" />

          <defs>
            <linearGradient id="logoArrowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Sweep shine on hover */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out z-20"
        />
      </div>
    </div>

    {/* Text mark */}
    <div className="flex flex-col leading-none">
      {/* Brand name */}
      <div className="flex items-baseline gap-0.5">
        <span
          className={cn(
            "text-[22px] font-black tracking-tight transition-colors duration-300",
            scrolled ? "text-slate-900" : "text-white"
          )}
          style={{ fontFamily: "'Inter', 'Arial Black', sans-serif" }}
        >
          S
        </span>
        <span
          className={cn(
            "text-[22px] font-black tracking-tight transition-colors duration-300",
            scrolled ? "text-slate-900" : "text-white"
          )}
          style={{ fontFamily: "'Inter', 'Arial Black', sans-serif" }}
        >
          M
        </span>
        <span
          className="text-[22px] font-black tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
          style={{ fontFamily: "'Inter', 'Arial Black', sans-serif" }}
        >
          C
        </span>
        <span className="sr-only">SMC - Smart Management Capital</span>
      </div>

    </div>
  </div>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { user, isAuthenticated, logout: logoutAction } = useAuthStore();

  // On non-homepage pages, always use the scrolled (solid white) navbar style
  const scrolled = isHomePage ? isScrolled : true;

  const handleLogout = async () => {
    await logoutAction();
    router.push("/");
  };

  const navLinks = [
    { name: "Protocol", href: "/#features" },
    { name: "Live Indexes", href: "/#indices" },
    { name: "Verification", href: "/#how-it-works" },
    { name: "Support", href: "/#footer" },
  ];

  // Track scroll position & active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      // Detect active section
      const sections = navLinks.map((l) => l.href.replace("/#", ""));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(navLinks[i].href);
          return;
        }
      }
      setActiveSection("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          scrolled
            ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.04)] py-2.5"
            : "bg-transparent py-5"
        )}
      >
        {/* Gradient accent line at top when scrolled */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-600 transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />

        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <SMCLogo scrolled={scrolled} />
          </Link>

          {/* Desktop Navigation */}
          <div
            className={cn(
              "hidden md:flex items-center rounded-full px-1 py-1 border transition-all duration-500",
              scrolled
                ? "bg-slate-50 border-slate-200/70"
                : "bg-white/[0.06] backdrop-blur-md border-white/[0.08]"
            )}
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300",
                    scrolled
                      ? isActive
                        ? "text-blue-600 bg-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                      : isActive
                        ? "text-white bg-white/[0.12]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  )}
                >
                  {link.name}
                  {/* Active dot indicator */}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth & Utilities */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center mr-1">
              <button
                aria-label="Platform Activity"
                className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  scrolled
                    ? "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                <Activity aria-hidden="true" className="h-[18px] w-[18px]" />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="User profile menu"
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300 outline-none group",
                        scrolled
                          ? "bg-slate-50/50 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                      )}
                    >
                      <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm transition-all">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <span className="hidden sm:block text-xs font-bold tracking-wide">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-60 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-xl transition-all animate-in fade-in-50 slide-in-from-top-2 duration-200"
                  >
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/50 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-semibold mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <DropdownMenuItem asChild>
                        <Link
                          href={
                            user?.role === "admin"
                              ? "/admin/dashboard"
                              : "/dashboard"
                          }
                          className="flex items-center p-2 rounded-lg cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-900 focus:text-blue-600 dark:focus:text-blue-400 transition-colors"
                        >
                          <TrendingUp className="mr-2.5 h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/kyc"
                          className="flex items-center p-2 rounded-lg cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-900 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors"
                        >
                          <Shield className="mr-2.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Identity & KYC</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center p-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 focus:bg-rose-50 dark:focus:bg-rose-950/20 cursor-pointer transition-colors"
                      >
                        <X className="mr-2.5 h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span>Disconnect</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "hidden sm:flex items-center text-sm font-semibold transition-all duration-300 px-4 py-2 rounded-lg",
                    scrolled
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  Log In
                </Link>
                <Button
                  asChild
                  className={cn(
                    "relative font-semibold rounded-xl px-6 h-10 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] overflow-hidden",
                    scrolled
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25"
                  )}
                >
                  <Link href="/register" className="flex items-center gap-1.5">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className={cn(
                "md:hidden p-2.5 rounded-xl border transition-all duration-300",
                scrolled
                  ? "text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100"
                  : "text-slate-300 bg-white/[0.06] backdrop-blur-sm border-white/[0.08] hover:bg-white/[0.12] hover:text-white"
              )}
            >
              {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-300 ease-out transform origin-top overflow-hidden md:hidden",
          isMenuOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between p-4 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/10">
                <svg viewBox="0 0 32 32" className="w-5 h-5">
                  <rect x="5" y="12" width="3" height="8" rx="0.5" fill="#ef4444" opacity="0.9" />
                  <rect x="11" y="8" width="3" height="12" rx="0.5" fill="#10b981" opacity="0.9" />
                  <rect x="17" y="10" width="3" height="10" rx="0.5" fill="#10b981" opacity="0.9" />
                  <rect x="23" y="6" width="3" height="14" rx="0.5" fill="#3b82f6" opacity="0.9" />
                  <polyline points="4,22 10,16 16,18 27,5" fill="none" stroke="url(#mobileLogoGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                  <defs>
                    <linearGradient id="mobileLogoGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black text-slate-900">SM</span>
                <span className="text-lg font-black bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">C</span>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="px-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between p-4 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}{" "}
                <ChevronRight size={16} className="text-slate-400/50" />
              </Link>
            ))}
          </div>

          <div className="p-4 mt-2 space-y-3 border-t border-slate-100 bg-slate-50/50">
            {isAuthenticated ? (
              <>
                <Link
                  href={
                    user?.role === "admin" || user?.role === "master_admin"
                      ? "/admin/dashboard"
                      : "/dashboard"
                  }
                  className="flex items-center justify-center h-12 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center h-12 text-base font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center h-12 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center h-12 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
