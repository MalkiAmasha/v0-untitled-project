import { create } from "zustand"
import type { RoomDimensions, RoomShape } from "./types"

interface RoomState {
  roomDimensions: RoomDimensions
  wallColor: string
  floorColor: string
  floorType: string
  roomShape: RoomShape
  updateRoomDimensions: (dimensions: RoomDimensions) => void
  updateWallColor: (color: string) => void
  updateFloorColor: (color: string) => void
  updateFloorType: (type: string) => void
  updateRoomShape: (shape: RoomShape) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  roomDimensions: {
    length: 6.5,
    width: 4.2,
    height: 2.8,
  },
  wallColor: "#f0ece3",
  floorColor: "#b5a898",
  floorType: "hardwood",
  roomShape: "rectangular",

  updateRoomDimensions: (dimensions) => {
    // Validate dimensions to ensure they're positive numbers
    const validatedDimensions = {
      length: Math.max(0.1, dimensions.length),
      width: Math.max(0.1, dimensions.width),
      height: Math.max(0.1, dimensions.height),
    }

    set({ roomDimensions: validatedDimensions })
  },
  updateWallColor: (color) => set({ wallColor: color }),
  updateFloorColor: (color) => set({ floorColor: color }),
  updateFloorType: (type) => set({ floorType: type }),
  updateRoomShape: (shape) => set({ roomShape: shape }),
}))
