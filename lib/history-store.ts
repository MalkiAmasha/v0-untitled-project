import { create } from "zustand"
import type { FurnitureItem } from "./types"

// Define the history state structure
interface HistoryState {
  past: FurnitureItem[][]
  future: FurnitureItem[][]
  canUndo: boolean
  canRedo: boolean
  saveState: (state: FurnitureItem[]) => void
  undo: () => FurnitureItem[] | null
  redo: () => FurnitureItem[] | null
  clear: () => void
}

// Create the history store
export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  // Save the current state to history
  saveState: (state) => {
    // Create a deep copy of the state to avoid reference issues
    const stateCopy = JSON.parse(JSON.stringify(state))

    set((prev) => {
      // Only add to history if the state is different from the last one
      if (prev.past.length > 0) {
        const lastState = prev.past[prev.past.length - 1]
        if (JSON.stringify(lastState) === JSON.stringify(stateCopy)) {
          return prev // No change, return the current state
        }
      }

      return {
        past: [...prev.past, stateCopy],
        future: [], // Clear future when a new state is added
        canUndo: true,
        canRedo: false,
      }
    })
  },

  // Fix the undo function to properly return the previous state
  undo: () => {
    const { past } = get()

    if (past.length <= 1) {
      return null // Nothing to undo or only initial state left
    }

    // Get the current state (last item in past)
    const current = past[past.length - 1]
    // Get the previous state (second to last item)
    const previous = past[past.length - 2]

    set((prev) => ({
      past: prev.past.slice(0, -1), // Remove the current state from past
      future: [current, ...prev.future], // Add current state to future
      canUndo: prev.past.length > 1, // Can undo if there's more than one state left
      canRedo: true,
    }))

    return previous
  },

  // Redo the last undone action
  redo: () => {
    const { past, future } = get()

    if (future.length === 0) {
      return null
    }

    const newFuture = [...future]
    const nextState = newFuture.shift()

    set({
      past: [...past, nextState!],
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    })

    return nextState || null
  },

  // Clear history
  clear: () => {
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    })
  },
}))
