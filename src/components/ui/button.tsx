import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "paypal"
    | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl";

    const variants = {
      default:
        "bg-white text-navy-950 hover:bg-slate-100 shadow-md focus:ring-white/50 active:scale-[0.98]",
      secondary:
        "bg-navy-800 text-slate-100 hover:bg-navy-700 border border-slate-700/60 focus:ring-slate-400 active:scale-[0.98]",
      outline:
        "border border-slate-700 bg-transparent text-slate-200 hover:bg-navy-800/80 hover:text-white focus:ring-slate-400 active:scale-[0.98]",
      ghost:
        "text-slate-300 hover:text-white hover:bg-navy-800/60 active:scale-[0.98]",
      danger:
        "bg-red-600/90 text-white hover:bg-red-500 focus:ring-red-500 shadow-sm active:scale-[0.98]",
      paypal:
        "bg-[#FFC439] hover:bg-[#F2B827] text-[#003087] font-semibold shadow-md hover:shadow-paypal-glow focus:ring-[#0070BA] active:scale-[0.98]",
      emerald:
        "bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-semibold shadow-glow focus:ring-emerald-400 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
