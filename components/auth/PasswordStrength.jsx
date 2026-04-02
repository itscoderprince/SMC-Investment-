"use client";

import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/lib/validations/auth";

export function PasswordStrength({ password }) {
    if (!password) return null;

    const { strength, label } = getPasswordStrength(password);

    const getStatusColor = () => {
        if (strength <= 33) return "bg-destructive";
        if (strength <= 66) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStatusText = () => {
        if (strength <= 33) return "text-destructive";
        if (strength <= 66) return "text-yellow-600";
        return "text-green-600";
    };

    return (
        <div className="space-y-1.5 mt-1">
            <div className="flex justify-between items-center px-0.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Security Level
                </span>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", getStatusText())}>
                    {label}
                </span>
            </div>
            <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-300", getStatusColor())}
                    style={{ width: `${strength}%` }}
                />
            </div>
        </div>
    );
}
