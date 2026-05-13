import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  productVariantId: string
  productId: string
  productName: string
  variantLabel: string
  price: number
  image: string
  stock: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productVariantId: string) => void
  updateQty: (productVariantId: string, quantity: number) => void
  clearCart: () => void
}

const derive = (items: CartItem[]) => ({
  itemCount: items.reduce((s, i) => s + i.quantity, 0),
  total: items.reduce((s, i) => s + i.price * i.quantity, 0),
})

const clampQuantity = (quantity: number, stock?: number) => {
  const maxStock = typeof stock === "number" ? Math.max(0, stock) : Number.POSITIVE_INFINITY
  if (maxStock === 0) return 0
  return Math.min(Math.max(1, quantity), maxStock)
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (item) =>
        set((state) => {
          const stock = Math.max(0, item.stock)
          if (stock === 0) return state

          const existing = state.items.find((i) => i.productVariantId === item.productVariantId)
          const items = existing
            ? state.items.map((i) =>
                i.productVariantId === item.productVariantId
                  ? {
                      ...i,
                      price: item.price,
                      image: item.image,
                      variantLabel: item.variantLabel,
                      stock,
                      quantity: clampQuantity(i.quantity + (item.quantity ?? 1), stock),
                    }
                  : i,
              )
            : [
                ...state.items,
                { ...item, stock, quantity: clampQuantity(item.quantity ?? 1, stock) },
              ]
          return { items, ...derive(items) }
        }),

      removeItem: (productVariantId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productVariantId !== productVariantId)
          return { items, ...derive(items) }
        }),

      updateQty: (productVariantId, quantity) =>
        set((state) => {
          const items = state.items
            .map((i) =>
              i.productVariantId === productVariantId
                ? { ...i, quantity: clampQuantity(quantity, i.stock) }
                : i,
            )
            .filter((i) => i.quantity > 0)
          return { items, ...derive(items) }
        }),

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    {
      name: "hi-shop-cart",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = state.items
            .map((item) => ({
              ...item,
              stock:
                typeof item.stock === "number" ? Math.max(0, item.stock) : Number.POSITIVE_INFINITY,
              quantity: clampQuantity(item.quantity, item.stock),
            }))
            .filter((item) => item.quantity > 0)
          Object.assign(state, derive(state.items))
        }
      },
    },
  ),
)
