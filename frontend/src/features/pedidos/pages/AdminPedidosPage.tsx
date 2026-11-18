import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { AdminNav } from '../../../shared/layout/AdminNav'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatCurrency, formatDate } from '../../../shared/utils/format'
import { DetallePedido } from '../components/DetallePedido'
import { useCambiarEstadoPedido, useCancelarPedido, usePedidos } from '../hooks'
import type { EstadoPedido, Pedido } from '../types'

const columnHelper = createColumnHelper<Pedido>()

export function AdminPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | ''>('')
  const [selected, setSelected] = useState<Pedido | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { data, isLoading, isError, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: estadoFiltro || undefined,
  })
  const cambiarEstado = useCambiarEstadoPedido()
  const cancelar = useCancelarPedido()
  const pedidos = data?.items ?? []
  const handleCambio = async (pedido: Pedido, estado: EstadoPedido) => {
    setActionError(null)
    try {
      await cambiarEstado.mutateAsync({ id: pedido.id, estado })
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }
  const handleCancelar = async (pedido: Pedido) => {
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
  const columns = [
    columnHelper.accessor('id', {
      header: 'pedido',
      cell: (info) => <span className="font-semibold text-slate-800">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('created_at', {
      header: 'fecha',
      cell: (info) => <span className="text-slate-600">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor('usuario_id', {
      header: 'usuario',
      cell: (info) => <span className="text-slate-600">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('direccion_entrega', {
      header: 'direccion',
      cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('total', {
      header: 'total',
      cell: (info) => <span className="font-semibold text-slate-800">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor('estado', {
      header: 'estado',
      cell: (info) => <BadgeEstado estado={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'acciones',
      cell: (info) => {
        const pedido = info.row.original
        return (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected(pedido)}>
              ver
            </Button>
            {pedido.estado === 'PENDIENTE' ? (
              <Button onClick={() => void handleCambio(pedido, 'EN_PREPARACION')}>preparar</Button>
            ) : null}
            {pedido.estado === 'EN_PREPARACION' ? (
              <Button onClick={() => void handleCambio(pedido, 'ENTREGADO')}>entregar</Button>
            ) : null}
            {pedido.estado === 'PENDIENTE' || pedido.estado === 'EN_PREPARACION' ? (
              <Button variant="danger" onClick={() => void handleCancelar(pedido)}>
                cancelar
              </Button>
            ) : null}
          </div>
        )
      },
    }),
  ]
  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 8 },
    },
  })
  return (
    <div>
      <AdminNav />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">pedidos</h1>
          <p className="text-sm text-slate-500">avanza o cancela pedidos segun la maquina de estados.</p>
        </div>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          value={estadoFiltro}
          onChange={(event) => setEstadoFiltro(event.target.value as EstadoPedido | '')}
        >
          <option value="">todos los estados</option>
          <option value="PENDIENTE">pendientes</option>
          <option value="EN_PREPARACION">en preparacion</option>
          <option value="ENTREGADO">entregados</option>
          <option value="CANCELADO">cancelados</option>
        </select>
      </div>
      {actionError ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{actionError}</p> : null}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <EstadoError message="no se pudieron cargar los pedidos" onRetry={() => void refetch()} />
      ) : pedidos.length === 0 ? (
        <EstadoVacio title="sin pedidos" message="no hay pedidos para el filtro seleccionado." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-semibold text-slate-600">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacion
            page={table.getState().pagination.pageIndex}
            totalPages={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page)}
          />
        </div>
      )}
      <Modal open={selected !== null} title={selected ? `pedido #${selected.id}` : 'pedido'} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BadgeEstado estado={selected.estado} />
              <p className="text-sm text-slate-600">{formatDate(selected.created_at)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">usuario:</span> #{selected.usuario_id}
              </p>
              <p>
                <span className="font-semibold text-slate-700">direccion:</span> {selected.direccion_entrega}
              </p>
              <p>
                <span className="font-semibold text-slate-700">forma de pago:</span> {selected.forma_pago.toLowerCase()}
              </p>
              <p>
                <span className="font-semibold text-slate-700">notas:</span> {selected.notas ?? 'sin notas'}
              </p>
            </div>
            <DetallePedido pedido={selected} />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}