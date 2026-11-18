import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { AdminNav } from '../../../shared/layout/AdminNav'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatCurrency } from '../../../shared/utils/format'
import { useCategorias } from '../../categorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useActualizarProducto, useActualizarStock, useCrearProducto, useEliminarProducto, useProductos } from '../hooks'
import type { Producto, ProductoPayload, ProductoStockPayload } from '../types'

const columnHelper = createColumnHelper<Producto>()

export function AdminProductosPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [disponibleFiltro, setDisponibleFiltro] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [stockOpen, setStockOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [stockProduct, setStockProduct] = useState<Producto | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { data: categorias = [] } = useCategorias()
  const { data, isLoading, isError, refetch } = useProductos({
    skip: 0,
    limit: 100,
    search: search || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
    disponible: disponibleFiltro === '' ? undefined : disponibleFiltro === 'true',
  })
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()
  const productos = data?.items ?? []
  const handleSave = async (values: ProductoPayload) => {
    if (editing) {
      await actualizar.mutateAsync({ id: editing.id, data: values })
    } else {
      await crear.mutateAsync(values)
    }
    setModalOpen(false)
    setEditing(null)
  }
  const handleStock = async (values: ProductoStockPayload) => {
    if (!stockProduct) {
      return
    }
    await actualizarStock.mutateAsync({ id: stockProduct.id, data: values })
    setStockOpen(false)
    setStockProduct(null)
  }
  const handleDelete = async (producto: Producto) => {
    setActionError(null)
    if (!window.confirm(`dar de baja el producto ${producto.nombre}?`)) {
      return
    }
    try {
      await eliminar.mutateAsync(producto.id)
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }
  const columns = [
    columnHelper.accessor('nombre', {
      header: 'producto',
      cell: (info) => (
        <div className="flex items-center gap-3">
          {info.row.original.imagen_url ? (
            <img
              src={info.row.original.imagen_url}
              alt={info.getValue()}
              className="h-12 w-12 rounded-lg object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-600">
              fs
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800">{info.getValue()}</p>
            <p className="max-w-xs truncate text-xs text-slate-500">{info.row.original.descripcion}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.categoria?.nombre ?? 'sin categoria', {
      id: 'categoria',
      header: 'categoria',
      cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('precio_base', {
      header: 'precio',
      cell: (info) => <span className="font-semibold text-slate-800">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor('stock', {
      header: 'stock',
      cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('disponible', {
      header: 'disponible',
      cell: (info) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            info.getValue() ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {info.getValue() ? 'si' : 'no'}
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
          <Button
            variant="secondary"
            onClick={() => {
              setStockProduct(info.row.original)
              setStockOpen(true)
            }}
          >
            stock
          </Button>
          <Button variant="danger" onClick={() => void handleDelete(info.row.original)}>
            dar de baja
          </Button>
        </div>
      ),
    }),
  ]
  const table = useReactTable({
    data: productos,
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
          <h1 className="text-2xl font-bold text-slate-900">productos</h1>
          <p className="text-sm text-slate-500">gestiona precios, stock y disponibilidad.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          nuevo producto
        </Button>
      </div>
      <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_180px]">
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setSearch(searchInput.trim())
          }}
        >
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="buscar producto"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button type="submit">buscar</Button>
        </form>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          value={categoriaId}
          onChange={(event) => setCategoriaId(event.target.value)}
        >
          <option value="">todas las categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          value={disponibleFiltro}
          onChange={(event) => setDisponibleFiltro(event.target.value)}
        >
          <option value="">disponibilidad</option>
          <option value="true">disponibles</option>
          <option value="false">no disponibles</option>
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
        <EstadoError message="no se pudieron cargar los productos" onRetry={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio title="sin productos" message="crea un producto o ajusta los filtros." />
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
        title={editing ? 'editar producto' : 'nuevo producto'}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      >
        <ProductoForm
          key={editing?.id ?? 'nuevo'}
          initial={editing ?? undefined}
          categorias={categorias}
          onSubmit={handleSave}
          onCancel={() => {
            setModalOpen(false)
            setEditing(null)
          }}
        />
      </Modal>
      <Modal
        open={stockOpen}
        title="actualizar stock"
        onClose={() => {
          setStockOpen(false)
          setStockProduct(null)
        }}
      >
        {stockProduct ? (
          <StockForm
            key={stockProduct.id}
            producto={stockProduct}
            onSubmit={handleStock}
            onCancel={() => {
              setStockOpen(false)
              setStockProduct(null)
            }}
          />
        ) : null}
      </Modal>
    </div>
  )
}