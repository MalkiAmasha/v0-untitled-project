"use client"

import { useViewSync } from "./view-sync-provider"
import { CuboidIcon, Grid3x3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ViewIndicator() {
  const { viewMode } = useViewSync()

  return (
    <div className="absolute bottom-4 right-4 bg-creamy-almond/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 shadow-md border border-soft-taupe">
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors",
          viewMode === "2d" ? "bg-rich-walnut text-creamy-almond" : "text-muted-foreground",
        )}
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="text-xs font-medium">2D</span>
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors",
          viewMode === "3d" ? "bg-rich-walnut text-creamy-almond" : "text-muted-foreground",
        )}
      >
        <CuboidIcon className="h-4 w-4" />
        <span className="text-xs font-medium">3D</span>
      </div>
    </div>
  )
}
