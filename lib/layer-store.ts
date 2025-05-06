import { create } from "zustand"

export interface Layer {
  id: string
  name: string
  visible: boolean
}

interface LayerState {
  layers: Layer[]
  toggleLayerVisibility: (id: string) => void
  addLayer: (layer: Layer) => void
  removeLayer: (id: string) => void
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: [
    { id: "walls-floor", name: "Walls & Floor", visible: true },
    { id: "furniture", name: "Furniture", visible: true },
    { id: "lighting", name: "Lighting", visible: true },
    { id: "decor", name: "Decor", visible: true },
    { id: "measurements", name: "Measurements", visible: true },
  ],

  toggleLayerVisibility: (id) => {
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, visible: !layer.visible } : layer)),
    }))
  },

  addLayer: (layer) => {
    set((state) => ({
      layers: [...state.layers, layer],
    }))
  },

  removeLayer: (id) => {
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
    }))
  },
}))
