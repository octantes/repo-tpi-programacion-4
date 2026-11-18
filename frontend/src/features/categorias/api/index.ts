import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaPayload } from '../types'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}

export async function createCategoria(payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', payload)
  return data
}

export async function updateCategoria(id: number, payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, payload)
  return data
}

export async function deleteCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}