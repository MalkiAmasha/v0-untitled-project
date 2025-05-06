import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  furnitureId: string
  name: string
  price: number
  color: string
  material: string
  quantity: number
  type: string
  dimensions: {
    width: number
    depth: number
    height: number
  }
  customizations?: Record<string, string>
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string, customizations?: Record<string, string>) => void
  updateQuantity: (id: string, quantity: number, customizations?: Record<string, string>) => void
  clearCart: () => void
  getItemCount: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = crypto.randomUUID()
        set((state) => {
          // Check if the item already exists with the same furniture ID, color, and material
          const existingItemIndex = state.items.findIndex(
            (i) => i.furnitureId === item.furnitureId && i.color === item.color && i.material === item.material,
          )

          if (existingItemIndex !== -1) {
            // If it exists, update the quantity
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += item.quantity
            return { items: updatedItems }
          }

          // Otherwise, add a new item
          return { items: [...state.items, { ...item, id }] }
        })
      },

      removeItem: (id: string, customizations: Record<string, string> = {}) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== id || JSON.stringify(item.customizations || {}) !== JSON.stringify(customizations),
          ),
        }))
      },

      updateQuantity: (id: string, quantity: number, customizations: Record<string, string> = {}) => {
        set((state) => {
          const itemIndex = state.items.findIndex(
            (item) => item.id === id && JSON.stringify(item.customizations || {}) === JSON.stringify(customizations),
          )

          if (itemIndex !== -1) {
            const updatedItems = [...state.items]
            updatedItems[itemIndex].quantity = quantity
            return { items: updatedItems }
          }

          return state
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
