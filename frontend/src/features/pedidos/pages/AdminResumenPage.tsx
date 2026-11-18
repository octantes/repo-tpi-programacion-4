import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { AdminNav } from '../../../shared/layout/AdminNav'
import { formatCurrency } from '../../../shared/utils/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks'

export function AdminResumenPage() {
  const { data, isLoading, isError, refetch } = useResumenPedidos()
  if (isLoading) {
    return (
      <div>
        <AdminNav />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div>
        <AdminNav />
        <EstadoError message="no se pudo cargar el resumen" onRetry={() => void refetch()} />
      </div>
    )
  }
  return (
    <div>
      <AdminNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">resumen</h1>
        <p className="text-sm text-slate-500">indicadores generales del negocio.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResumenCard title="pendientes" value={data.pendientes} detail="pedidos esperando preparacion" tone="orange" />
        <ResumenCard
          title="en preparacion"
          value={data.en_preparacion}
          detail="pedidos actualmente en cocina"
          tone="blue"
        />
        <ResumenCard title="entregados" value={data.entregados} detail="pedidos completados" tone="green" />
        <ResumenCard title="cancelados" value={data.cancelados} detail="pedidos cancelados" tone="red" />
        <ResumenCard title="pedidos de hoy" value={data.pedidos_hoy} detail="creados durante el dia" tone="slate" />
        <ResumenCard
          title="ingresos entregados"
          value={formatCurrency(data.ingresos_entregados)}
          detail="total de pedidos entregados"
          tone="green"
        />
      </div>
    </div>
  )
}