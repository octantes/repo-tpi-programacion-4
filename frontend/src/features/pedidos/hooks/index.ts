import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido, cancelarPedido, createPedido, getPedidos, getResumenPedidos } from '../api'
import type { EstadoPedido, PedidoFiltros } from '../types'

export function usePedidos(filtros: PedidoFiltros) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['resumenPedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['resumenPedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['resumenPedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['resumenPedidos'],
    queryFn: getResumenPedidos,
  })
}