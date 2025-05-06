"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useFurnitureStore } from "@/lib/furniture-store"
import { useRoomStore } from "@/lib/room-store"

interface ViewSyncContextType {
  viewMode: "2d" | "3d"
  setViewMode: (mode: "2d" | "3d") => void
  selectedItemId: string | null
  setSelectedItemId: (id: string | null) => void
  syncViewTransform: (transform: ViewTransform) => void
  currentTransform: ViewTransform
  convertCoordinates: (
    position: { x: number; y?: number; z: number },
    from: "2d" | "3d",
    to: "2d" | "3d",
  ) => { x: number; y: number; z: number }
}

interface ViewTransform {
  position?: { x: number; y: number }
  scale?: number
  rotation?: number
}

const ViewSyncContext = createContext<ViewSyncContextType | undefined>(undefined)

export function ViewSyncProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d")
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [currentTransform, setCurrentTransform] = useState<ViewTransform>({
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  })

  const { updateFurnitureItem, furnitureItems } = useFurnitureStore()
  const { roomDimensions } = useRoomStore()

  // Function to sync view transforms between 2D and 3D views
  const syncViewTransform = (transform: ViewTransform) => {
    // Only update if values have actually changed
    setCurrentTransform((prev) => {
      // Check if the new transform is different from the current one
      const positionChanged =
        transform.position && (prev.position?.x !== transform.position.x || prev.position?.y !== transform.position.y)

      const scaleChanged = transform.scale !== undefined && prev.scale !== transform.scale

      const rotationChanged = transform.rotation !== undefined && prev.rotation !== transform.rotation

      // Only update state if something changed
      if (positionChanged || scaleChanged || rotationChanged) {
        return { ...prev, ...transform }
      }

      // Return previous state if nothing changed
      return prev
    })
  }

  // Function to convert coordinates between 2D and 3D views
  const convertCoordinates = (
    position: { x: number; y?: number; z: number },
    from: "2d" | "3d",
    to: "2d" | "3d",
  ): { x: number; y: number; z: number } => {
    // If the source and target views are the same, return the original position
    if (from === to) {
      return {
        x: position.x,
        y: position.y !== undefined ? position.y : 0,
        z: position.z,
      }
    }

    // Both 2D and 3D views use the same coordinate system now
    // The origin (0,0) is at the center of the room in both views
    // The only difference is that in 2D, y is always 0
    return {
      x: position.x,
      y: from === "2d" ? 0 : position.y !== undefined ? position.y : 0,
      z: position.z,
    }
  }

  // When view mode changes, ensure consistent positioning
  useEffect(() => {
    if (viewMode === "2d") {
      // When switching to 2D, ensure all items have y=0
      furnitureItems.forEach((item) => {
        if (item.position.y !== 0) {
          updateFurnitureItem(item.id, {
            position: { ...item.position, y: 0 },
          })
        }
      })
    }
  }, [viewMode, furnitureItems, updateFurnitureItem])

  return (
    <ViewSyncContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedItemId,
        setSelectedItemId,
        syncViewTransform,
        currentTransform,
        convertCoordinates,
      }}
    >
      {children}
    </ViewSyncContext.Provider>
  )
}

export function useViewSync() {
  const context = useContext(ViewSyncContext)
  if (context === undefined) {
    throw new Error("useViewSync must be used within a ViewSyncProvider")
  }
  return context
}
