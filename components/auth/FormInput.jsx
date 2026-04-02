"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FormInput = React.forwardRef(
    (
        {
            label,
            error,
            icon: Icon,
            rightIcon,
            className,
            containerClassName,
            ...props
        },
        ref
    ) => {
        return (
            <div className={cn("grid gap-2", containerClassName)}>
                {label && (
                    <Label
                        htmlFor={props.id || props.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {label}
                    </Label>
                )}
                <div className="relative">
                    {Icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <Icon className="size-4" />
                        </div>
                    )}
                    <Input
                        ref={ref}
                        className={cn(
                            "h-9 text-sm transition-all duration-200",
                            Icon && "pl-10",
                            rightIcon && "pr-10",
                            error
                                ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive"
                                : "border-input focus-visible:ring-ring",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="text-destructive text-[0.8rem] font-medium mt-1">{error}</p>}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";

export { FormInput };
