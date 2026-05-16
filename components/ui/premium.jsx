"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * UIButton - A high-level premium Button component
 * Features built-in micro-animations (Framer Motion), automated loading spinners,
 * and curated premium styling variations.
 */
const UIButton = React.forwardRef(({
    children,
    className,
    variant = "primary",
    size = "default",
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = "left",
    ...props
}, ref) => {
    // Custom premium styles
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-semibold rounded-xl",
        gradient: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/15 font-semibold rounded-xl",
        glass: "bg-white/10 hover:bg-white/15 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 text-slate-900 dark:text-white border border-slate-200/50 dark:border-white/5 backdrop-blur-md rounded-xl",
        outline: "border border-slate-200 dark:border-white/10 bg-background hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium rounded-xl",
        dark: "bg-slate-950 hover:bg-slate-900 text-white shadow-md font-semibold rounded-xl dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100",
    };

    const isInteractionDisabled = isLoading || disabled;

    return (
        <motion.div
            whileHover={isInteractionDisabled ? {} : { scale: 1.015 }}
            whileTap={isInteractionDisabled ? {} : { scale: 0.98 }}
            className={cn("inline-flex w-full sm:w-auto", className)}
        >
            <Button
                ref={ref}
                disabled={isInteractionDisabled}
                className={cn(
                    "w-full h-11 transition-colors flex items-center justify-center gap-2",
                    variants[variant] || "",
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="size-4 animate-spin shrink-0" />}
                
                {!isLoading && Icon && iconPosition === "left" && (
                    <Icon className="size-4 shrink-0 opacity-80" />
                )}
                
                <span>{children}</span>
                
                {!isLoading && Icon && iconPosition === "right" && (
                    <Icon className="size-4 shrink-0 opacity-80" />
                )}
            </Button>
        </motion.div>
    );
});
UIButton.displayName = "UIButton";


/**
 * UIDropdown - A simplified single-prop high-level Dropdown menu
 * Automatically parses items list, supports icons, Next.js Links, and click handlers.
 */
function UIDropdown({
    label,
    icon: TriggerIcon,
    items = [],
    align = "end",
    className,
    triggerClassName,
    contentClassName,
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-slate-950/20 backdrop-blur-xl hover:bg-white/20 dark:hover:bg-slate-950/40 text-slate-800 dark:text-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-300 outline-none",
                        triggerClassName
                    )}
                >
                    {TriggerIcon && <TriggerIcon className="size-4 opacity-75" />}
                    <span>{label}</span>
                    <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={align}
                className={cn(
                    "min-w-[180px] bg-white/40 dark:bg-slate-950/30 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-2xl p-1.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in fade-in-50 slide-in-from-top-3 duration-200",
                    contentClassName
                )}
            >
                {items.map((item, index) => {
                    if (item.type === "separator") {
                        return <DropdownMenuSeparator key={`sep-${index}`} className="my-1.5 bg-white/20 dark:bg-white/5" />;
                    }

                    const ItemIcon = item.icon;
                    const isDestructive = item.variant === "destructive";

                    const content = (
                        <div className="flex items-center gap-2.5 w-full">
                            {ItemIcon && (
                                <ItemIcon
                                    className={cn(
                                        "size-4 shrink-0",
                                        isDestructive
                                            ? "text-red-500"
                                            : "text-slate-800 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white"
                                    )}
                                />
                            )}
                            <span className="font-semibold text-xs">{item.label}</span>
                        </div>
                    );

                    const baseClasses = cn(
                        "group flex items-center w-full px-3 py-2.5 rounded-xl cursor-pointer outline-none transition-all select-none",
                        isDestructive
                            ? "text-red-600 focus:bg-red-500/20 dark:focus:bg-red-500/15 focus:text-red-500"
                            : "text-slate-800 dark:text-slate-300 focus:bg-white/30 dark:focus:bg-white/10 focus:text-black dark:focus:text-white"
                    );

                    if (item.href) {
                        return (
                            <DropdownMenuItem key={`item-${index}`} asChild>
                                <Link href={item.href} className={baseClasses}>
                                    {content}
                                </Link>
                            </DropdownMenuItem>
                        );
                    }

                    return (
                        <DropdownMenuItem
                            key={`item-${index}`}
                            onClick={item.onClick}
                            className={baseClasses}
                        >
                            {content}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { UIButton, UIDropdown };
