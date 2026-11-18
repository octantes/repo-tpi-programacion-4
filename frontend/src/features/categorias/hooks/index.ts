import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre: string; descripcion: string } }) =>
      updateCategoria(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}