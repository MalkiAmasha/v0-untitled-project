"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useViewSync } from "./view-sync-provider"

interface ViewTransitionProps {
  children: React.ReactNode
}

export function ViewTransition({ children }: ViewTransitionProps) {
  const { viewMode } = useViewSync()
  const [prevViewMode, setPrevViewMode] = useState(viewMode)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (viewMode !== prevViewMode) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setPrevViewMode(viewMode)
      }, 500) // Match this with the animation duration
      return () => clearTimeout(timer)
    }
  }, [viewMode, prevViewMode])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
