import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { EstadoPedido, Pedido, PedidoCreate, PedidoFiltros, PedidoPaginados, ResumenPedidos } from '../types'

export async function createPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', payload)
  return data
}

export async function getPedidos(filtros: PedidoFiltros): Promise<PedidoPaginados> {
  const { data } = await axiosInstance.get<PedidoPaginados>('/pedidos', { params: filtros })
  return data
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')
  return data
}