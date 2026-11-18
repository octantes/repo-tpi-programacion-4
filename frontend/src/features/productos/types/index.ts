import type { Categoria } from '../../categorias'

export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria | null
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}

export interface ProductoPayload {
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
}

export interface ProductoStockPayload {
  stock: number
  disponible: boolean
}

export interface ProductoFiltros {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}