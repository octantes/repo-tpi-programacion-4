import { useState } from 'react'
import { useCategorias } from '../../categorias'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks'

const LIMITE = 6

export function CatalogoPage() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const { data: categorias = [] } = useCategorias()
  const { data, isLoading, isError, refetch } = useProductos({
    skip: page * LIMITE,
    limit: LIMITE,
    search: search || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  })
  const productos = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMITE)
  return (
    <div>
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-10 text-white shadow-lg">
        <p className="text-sm font-semibold tracking-[0.25em] text-orange-100">food store</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-black tracking-tight">comida rica, pedidos simples</h1>
        <p className="mt-3 max-w-xl text-orange-50">elegi tus productos, arma el carrito y confirma tu pedido.</p>
      </section>
      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(0)
            setSearch(searchInput.trim())
          }}
        >
          <Input
            placeholder="buscar productos por nombre"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button type="submit">buscar</Button>
        </form>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          value={categoriaId}
          onChange={(event) => {
            setCategoriaId(event.target.value)
            setPage(0)
          }}
        >
          <option value="">todas las categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">catalogo</h2>
        <p className="text-sm text-slate-500">{total} productos</p>
      </div>
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: LIMITE }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EstadoError message="no se pudieron cargar los productos" onRetry={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio title="sin resultados" message="proba con otra busqueda o categoria." />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}