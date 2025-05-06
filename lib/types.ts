// Room types
export interface RoomDimensions {
  length: number
  width: number
  height: number
}

export type RoomShape = "rectangular" | "l-shaped" | "custom"

// Furniture types
export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Dimensions {
  width: number
  depth: number
  height: number
}

export interface FurnitureItem {
  id: string
  type: string
  name: string
  position: Vector3
  dimensions: Dimensions
  rotation: Vector3
  color: string
  material: string
}
