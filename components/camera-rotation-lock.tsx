"use client"

import { LockIcon, UnlockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface CameraRotationLockProps {
  isLocked: boolean
  onToggle: () => void
  className?: string
}

export function CameraRotationLock({ isLocked, onToggle, className }: CameraRotationLockProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isLocked ? "default" : "outline"}
            size="sm"
            onClick={onToggle}
            className={cn(
              "flex items-center gap-1 transition-colors",
              isLocked ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              className,
            )}
          >
            {isLocked ? (
              <>
                <LockIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Rotation Locked</span>
              </>
            ) : (
              <>
                <UnlockIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Rotation Unlocked</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isLocked
            ? "Camera rotation is locked. You can move furniture without rotating the view."
            : "Camera rotation is unlocked. You can rotate the view."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
