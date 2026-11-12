import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "emerald"
    | "lime"
    | "paypal"
    | "outline"
    | "warning"
    | "danger"
    | "muted";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center font-medium rounded-full transition-colors select-none";

  const variants = {
    default: "bg-navy-800 text-slate-200 border border-slate-700/60",
    emerald:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    lime: "bg-lime-500/15 text-lime-400 border border-lime-500/30",
    paypal: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    outline: "border border-slate-700 text-slate-300",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/15 text-red-400 border border-red-500/30",
    muted: "bg-slate-800/60 text-slate-400 border border-slate-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <div className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </div>
  );
}
