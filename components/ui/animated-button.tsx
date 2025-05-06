"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-highlight text-white hover:shadow-lg",
        teal: "bg-highlight-teal text-white hover:bg-highlight-teal/90",
        gold: "bg-highlight-gold text-charcoal-brown hover:bg-highlight-gold/90",
        terracotta: "bg-highlight-terracotta text-white hover:bg-highlight-terracotta/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "animate-pulse-subtle",
        float: "animate-float",
        glow: "hover-glow",
        lift: "hover-lift",
        scale: "hover-scale",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  },
)

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ripple?: boolean
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, animation, ripple = true, children, ...props }, ref) => {
    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return

      const button = e.currentTarget
      const circle = document.createElement("span")
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      const radius = diameter / 2

      circle.style.width = circle.style.height = `${diameter}px`
      circle.style.left = `${e.clientX - button.offsetLeft - radius}px`
      circle.style.top = `${e.clientY - button.offsetTop - radius}px`
      circle.classList.add("ripple-effect")

      const rippleEffect = button.getElementsByClassName("ripple-effect")[0]
      if (rippleEffect) {
        rippleEffect.remove()
      }

      button.appendChild(circle)
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        onClick={handleRipple}
        {...props}
      >
        {children}
        <style jsx>{`
          .ripple-effect {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(255, 255, 255, 0.3);
            pointer-events: none;
          }
          
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}</style>
      </button>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton, buttonVariants }
