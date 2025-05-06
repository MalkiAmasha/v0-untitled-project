"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface GlossyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
}

export const GlossyButton = forwardRef<HTMLButtonElement, GlossyButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative px-4 py-2 text-base font-medium rounded-xl transition-all duration-200",
          "border shadow-sm",
          variant === "primary"
            ? "bg-gradient-to-b from-[#8a7f72] to-[#5d4037] text-white border-[#8a7f72]/30"
            : "bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] text-[#5d4037] border-[#d0d0d0]",
          "hover:shadow-md active:shadow-inner active:translate-y-[1px]",
          className,
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span
          className={cn(
            "absolute inset-0 rounded-xl opacity-20",
            "bg-gradient-to-b from-white to-transparent",
            "pointer-events-none",
          )}
        />
      </button>
    )
  },
)

GlossyButton.displayName = "GlossyButton"
