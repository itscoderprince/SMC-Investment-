"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const FieldGroup = ({ className, ...props }) => {
    return (
        <div
            data-slot="field-group"
            className={cn("flex flex-col gap-4", className)}
            {...props}
        />
    )
}

const Field = ({ className, ...props }) => {
    return (
        <div
            data-slot="field"
            className={cn("grid gap-1.5", className)}
            {...props}
        />
    )
}

const FieldLabel = ({ className, icon: Icon, children, ...props }) => {
    return (
        <Label
            data-slot="field-label"
            className={cn("flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
            {...props}
        >
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            {children}
        </Label>
    )
}

const FieldDescription = ({ className, ...props }) => {
    return (
        <p
            data-slot="field-description"
            className={cn("text-muted-foreground text-[0.8rem]", className)}
            {...props}
        />
    )
}

const FieldSeparator = ({ className, children, ...props }) => {
    return (
        <div
            data-slot="field-separator"
            className={cn("relative flex items-center py-2", className)}
            {...props}
        >
            <div className="flex-grow border-t border-muted" />
            {children && (
                <span className="mx-4 flex-shrink text-xs font-medium uppercase tracking-wider text-muted-foreground bg-white px-1">
                    {children}
                </span>
            )}
            <div className="flex-grow border-t border-muted" />
        </div>
    )
}

export { Field, FieldLabel, FieldDescription, FieldGroup, FieldSeparator }
