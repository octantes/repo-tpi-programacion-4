import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatCurrency, formatDate } from '../../../shared/utils/format'
import { DetallePedido } from '../components/DetallePedido'
import { useCancelarPedido, usePedidos } from '../hooks'
import type { Pedido } from '../types'

export function MisPedidosPage() {
  const { data, isLoading, isError, refetch } = usePedidos({ skip: 0, limit: 100 })
  const cancelar = useCancelarPedido()
  const [actionError, setActionError] = useState<string | null>(null)
  const pedidos = data?.items ?? []
  const handleCancel = async (pedido: Pedido) => {
    setActionError(null)
    if (!window.confirm(`cancelar el pedido #${pedido.id}?`)) {
      return
    }
    try {
      await cancelar.mutateAsync(pedido.id)
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    )
  }
  if (isError) {
    return <EstadoError message="no se pudieron cargar tus pedidos" onRetry={() => void refetch()} />
  }
  if (pedidos.length === 0) {
    return (
      <EstadoVacio title="todavia no tenes pedidos" message="cuando confirmes un pedido vas a verlo en esta seccion.">
        <Link
          to="/"
          className="inline-flex rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          ver catalogo
        </Link>
      </EstadoVacio>
    )
  }
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">mis pedidos</h1>
      {actionError ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{actionError}</p> : null}
      <div className="space-y-5">
        {pedidos.map((pedido) => (
          <Card key={pedido.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">pedido #{pedido.id}</h2>
                  <BadgeEstado estado={pedido.estado} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{formatDate(pedido.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{formatCurrency(pedido.total)}</p>
                <p className="text-xs tracking-wide text-slate-500">{pedido.forma_pago.toLowerCase()}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 md:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-700">direccion:</span> {pedido.direccion_entrega}
              </p>
              <p>
                <span className="font-semibold text-slate-700">notas:</span> {pedido.notas ?? 'sin notas'}
              </p>
            </div>
            <div className="mt-4">
              <DetallePedido pedido={pedido} />
            </div>
            {pedido.estado === 'PENDIENTE' ? (
              <div className="mt-4 flex justify-end">
                <Button variant="danger" onClick={() => void handleCancel(pedido)}>
                  cancelar pedido
                </Button>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}