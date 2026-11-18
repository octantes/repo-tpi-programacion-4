import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface ProductoParaCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
}

interface CartState {
  items: CartItem[]
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (producto, cantidad = 1) => {
        const existente = get().items.find((item) => item.producto_id === producto.producto_id)
        if (existente) {
          set({
            items: get().items.map((item) =>
              item.producto_id === producto.producto_id
                ? { ...item, cantidad: item.cantidad + cantidad }
                : item,
            ),
          })
          return
        }
        set({ items: [...get().items, { ...producto, cantidad }] })
      },
      quitar: (productoId) => set({ items: get().items.filter((item) => item.producto_id !== productoId) }),
      cambiarCantidad: (productoId, cantidad) => {
        const nuevaCantidad = Math.max(1, Math.floor(cantidad))
        set({
          items: get().items.map((item) =>
            item.producto_id === productoId ? { ...item, cantidad: nuevaCantidad } : item,
          ),
        })
      },
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((acumulado, item) => acumulado + item.precio_unitario * item.cantidad, 0),
    }),
    {
      name: 'foodstore-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)