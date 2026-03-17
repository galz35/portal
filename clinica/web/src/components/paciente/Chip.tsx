"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    multi?: boolean;
}

export function Chip({ active, multi = false, className, ...props }: ChipProps) {
    const activeClass = multi 
        ? "border-slate-400 bg-slate-200 text-slate-800" 
        : "border-orange-500 bg-orange-100 text-orange-900";

    return (
        <div
            className={cn(
                "inline-block cursor-pointer select-none rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition-all duration-150 hover:border-slate-400",
                "data-[active=true]:shadow-inner",
                className,
                active && activeClass
            )}
            data-active={active}
            {...props}
        />
    );
}

export function ChipGroup(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div 
            className="flex flex-wrap gap-2"
            {...props}
        />
    )
}
