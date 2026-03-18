import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  items: any[]
  addItem: (product: any) => void
  removeItem: (id: string) => void
  isWishlisted: (id: string) => boolean
  toggle: (product: any) => void
}

export const useWishlistStore = create<WishlistStore>()(persist((set, get) => ({
  items: [],
  addItem: (product: any) => set((state) => {
    const exists = state.items.find((p: any) => p._id === product._id)
    if (exists) return state
    return { items: [...state.items, product] }
  }),
  removeItem: (id: string) => set((state) => ({
    items: state.items.filter((item: any) => item._id !== id)
  })),
  isWishlisted: (id: string) => get().items.some((p: any) => p._id === id),
  toggle: (product: any) => {
    const exists = get().items.find((p: any) => p._id === product._id)
    if (exists) get().removeItem(product._id)
    else get().addItem(product)
  },
}), { name: 'agrawal-wishlist' }))
