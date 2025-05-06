import { create } from "zustand"
import type { FurnitureItem } from "./types"

interface FurnitureState {
  furnitureItems: FurnitureItem[]
  addFurnitureItem: (item: FurnitureItem) => void
  updateFurnitureItem: (id: string, updates: Partial<FurnitureItem>) => void
  removeFurnitureItem: (id: string) => void
  getFurnitureItem: (id: string) => FurnitureItem | undefined
  setFurnitureItems: (items: FurnitureItem[]) => void
}

export const useFurnitureStore = create<FurnitureState>((set, get) => ({
  furnitureItems: [],

  addFurnitureItem: (item) =>
    set((state) => ({
      furnitureItems: [...state.furnitureItems, item],
    })),

  updateFurnitureItem: (id, updates) =>
    set((state) => ({
      furnitureItems: state.furnitureItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),

  removeFurnitureItem: (id) =>
    set((state) => ({
      furnitureItems: state.furnitureItems.filter((item) => item.id !== id),
    })),

  getFurnitureItem: (id) => {
    return get().furnitureItems.find((item) => item.id === id)
  },

  setFurnitureItems: (items) => set({ furnitureItems: items }),
}))
