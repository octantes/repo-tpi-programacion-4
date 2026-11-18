import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { AdminNav } from '../../../shared/layout/AdminNav'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks'
import type { Categoria, CategoriaPayload } from '../types'

const columnHelper = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
  const { data: categorias = [], isLoading, isError, refetch } = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const handleSave = async (values: CategoriaPayload) => {
    if (editing) {
      await actualizar.mutateAsync({ id: editing.id, data: values })
    } else {
      await crear.mutateAsync(values)
    }
    setModalOpen(false)
    setEditing(null)
  }
  const handleDelete = async (categoria: Categoria) => {
    setActionError(null)
    if (!window.confirm(`dar de baja la categoria ${categoria.nombre}?`)) {
      return
    }
    try {
      await eliminar.mutateAsync(categoria.id)
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }
  const columns = [
    columnHelper.accessor('nombre', {
      header: 'nombre',
      cell: (info) => <span className="font-semibold text-slate-800">{info.getValue()}</span>,
    }),
    columnHelper.accessor('descripcion', {
      header: 'descripcion',
      cell: (info) => <span className="text-slate-600">{info.getValue() || 'sin descripcion'}</span>,
    }),
    columnHelper.accessor('activo', {
      header: 'estado',
      cell: (info) => (
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          {info.getValue() ? 'activa' : 'inactiva'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'acciones',
      cell: (info) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setEditing(info.row.original)
              setModalOpen(true)
            }}
          >
            editar
          </Button>
          <Button variant="danger" onClick={() => void handleDelete(info.row.original)}>
            dar de baja
          </Button>
        </div>
      ),
    }),
  ]
  const table = useReactTable({
    data: categorias,
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
          <h1 className="text-2xl font-bold text-slate-900">categorias</h1>
          <p className="text-sm text-slate-500">administra las categorias activas del catalogo.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          nueva categoria
        </Button>
      </div>
      {actionError ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{actionError}</p> : null}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <EstadoError message="no se pudieron cargar las categorias" onRetry={() => void refetch()} />
      ) : categorias.length === 0 ? (
        <EstadoVacio title="sin categorias" message="crea la primera categoria para organizar el catalogo." />
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
      <Modal
        open={modalOpen}
        title={editing ? 'editar categoria' : 'nueva categoria'}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      >
        <CategoriaForm
          key={editing?.id ?? 'nueva'}
          initial={editing ?? undefined}
          onSubmit={handleSave}
          onCancel={() => {
            setModalOpen(false)
            setEditing(null)
          }}
        />
      </Modal>
    </div>
  )
}