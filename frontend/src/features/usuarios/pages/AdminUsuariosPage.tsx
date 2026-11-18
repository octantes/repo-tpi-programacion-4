import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { AdminNav } from '../../../shared/layout/AdminNav'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks'
import type { Usuario } from '../types'

const columnHelper = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const { data: usuarios = [], isLoading, isError, refetch } = useUsuarios()
  const actual = useAuthStore((state) => state.usuario)
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const [actionError, setActionError] = useState<string | null>(null)
  const handleActivar = async (usuario: Usuario) => {
    setActionError(null)
    try {
      await activar.mutateAsync(usuario.id)
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }
  const handleDesactivar = async (usuario: Usuario) => {
    setActionError(null)
    try {
      await desactivar.mutateAsync(usuario.id)
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }
  const columns = [
    columnHelper.accessor('username', {
      header: 'usuario',
      cell: (info) => <span className="font-semibold text-slate-800">{info.getValue()}</span>,
    }),
    columnHelper.accessor('full_name', {
      header: 'nombre',
      cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'email',
      cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: 'rol',
      cell: (info) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            info.getValue() === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('disabled', {
      header: 'estado',
      cell: (info) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            info.getValue() ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {info.getValue() ? 'inactivo' : 'activo'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'acciones',
      cell: (info) => {
        const usuario = info.row.original
        return (
          <div className="flex justify-end gap-2">
            {usuario.disabled ? (
              <Button variant="secondary" onClick={() => void handleActivar(usuario)}>
                activar
              </Button>
            ) : null}
            {!usuario.disabled && usuario.id !== actual?.id ? (
              <Button variant="danger" onClick={() => void handleDesactivar(usuario)}>
                desactivar
              </Button>
            ) : null}
          </div>
        )
      },
    }),
  ]
  const table = useReactTable({
    data: usuarios,
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">usuarios</h1>
        <p className="text-sm text-slate-500">activa o desactiva cuentas de la aplicacion.</p>
      </div>
      {actionError ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{actionError}</p> : null}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <EstadoError message="no se pudieron cargar los usuarios" onRetry={() => void refetch()} />
      ) : usuarios.length === 0 ? (
        <EstadoVacio title="sin usuarios" message="no hay usuarios registrados." />
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
    </div>
  )
}