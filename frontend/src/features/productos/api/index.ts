import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Producto, ProductoFiltros, ProductoPayload, ProductosPaginados, ProductoStockPayload } from '../types'

export async function getProductos(filtros: ProductoFiltros): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export async function createProducto(payload: ProductoPayload): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', payload)
  return data
}

export async function updateProducto(id: number, payload: ProductoPayload): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, payload)
  return data
}

export async function updateProductoStock(id: number, payload: ProductoStockPayload): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, payload)
  return data
}

export async function deleteProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}