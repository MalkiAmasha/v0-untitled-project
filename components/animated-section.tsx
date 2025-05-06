"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-in" | "slide-up" | "slide-down" | "slide-in-right" | "slide-in-left"
  delay?: number
  threshold?: number
  once?: boolean
}

export function AnimatedSection({
  children,
  className,
  animation = "fade-in",
  delay = 0,
  threshold = 0.1,
  once = true,
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setTimeout(() => {
            setIsVisible(true)
            setHasAnimated(true)
          }, delay)
        } else if (!entry.isIntersecting && !once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay, threshold, once, hasAnimated])

  const animationClasses = {
    "fade-in": "opacity-0 transition-opacity duration-700",
    "slide-up": "opacity-0 translate-y-10 transition-all duration-700",
    "slide-down": "opacity-0 -translate-y-10 transition-all duration-700",
    "slide-in-right": "opacity-0 translate-x-10 transition-all duration-700",
    "slide-in-left": "opacity-0 -translate-x-10 transition-all duration-700",
  }

  const visibleClasses = {
    "fade-in": "opacity-100",
    "slide-up": "opacity-100 translate-y-0",
    "slide-down": "opacity-100 translate-y-0",
    "slide-in-right": "opacity-100 translate-x-0",
    "slide-in-left": "opacity-100 translate-x-0",
  }

  return (
    <div ref={ref} className={cn(animationClasses[animation], isVisible && visibleClasses[animation], className)}>
      {children}
    </div>
  )
}
