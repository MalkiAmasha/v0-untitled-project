"use client"

import { useEffect } from "react"
import { useFurnitureStore } from "@/lib/furniture-store"
import { useViewSync } from "./view-sync-provider"
import { useRoomStore } from "@/lib/room-store"

export function FurnitureItemSync() {
  const { furnitureItems, updateFurnitureItem } = useFurnitureStore()
  const { viewMode, selectedItemId, convertCoordinates } = useViewSync()
  const { roomDimensions } = useRoomStore()

  // Ensure furniture items have consistent properties between 2D and 3D views
  useEffect(() => {
    // This effect runs when the view mode changes
    // We need to ensure all furniture items are properly positioned in the new view

    // When switching views, ensure all items have proper positioning
    furnitureItems.forEach((item) => {
      const updates: Partial<typeof item> = {}
      let needsUpdate = false

      // Ensure items stay within room boundaries
      const halfLength = roomDimensions.length / 2
      const halfWidth = roomDimensions.width / 2

      // Calculate the maximum allowed positions based on item dimensions
      const maxX = halfLength - item.dimensions.width / 2
      const minX = -halfLength + item.dimensions.width / 2
      const maxZ = halfWidth - item.dimensions.depth / 2
      const minZ = -halfWidth + item.dimensions.depth / 2

      // Check if position needs to be constrained
      if (item.position.x > maxX || item.position.x < minX || item.position.z > maxZ || item.position.z < minZ) {
        updates.position = {
          x: Math.max(minX, Math.min(maxX, item.position.x)),
          y: viewMode === "2d" ? 0 : item.position.y,
          z: Math.max(minZ, Math.min(maxZ, item.position.z)),
        }
        needsUpdate = true
      } else if (viewMode === "2d" && item.position.y !== 0) {
        // In 2D view, ensure y is always 0
        updates.position = {
          ...item.position,
          y: 0,
        }
        needsUpdate = true
      }

      // Apply updates if needed
      if (needsUpdate) {
        updateFurnitureItem(item.id, updates)
      }
    })
  }, [viewMode, furnitureItems, roomDimensions, updateFurnitureItem])

  return null
}
