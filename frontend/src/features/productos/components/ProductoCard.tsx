import { useCartStore } from '../../../store/cartStore'
import { formatCurrency } from '../../../shared/utils/format'
import { Button } from '../../../shared/ui/Button'
import type { Producto } from '../types'

interface ProductoCardProps {
  producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar)
  const puedeAgregar = producto.disponible && producto.stock > 0
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {producto.imagen_url ? (
        <img src={producto.imagen_url} alt={producto.nombre} className="h-48 w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-4xl font-black text-orange-300">
          fs
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-orange-600">
              {producto.categoria?.nombre ?? 'sin categoria'}
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{producto.nombre}</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            stock {producto.stock}
          </span>
        </div>
        <p className="mt-2 flex-1 text-sm text-slate-500">{producto.descripcion || 'sin descripcion'}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xl font-bold text-slate-900">{formatCurrency(producto.precio_base)}</p>
          <Button
            disabled={!puedeAgregar}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
              })
            }
          >
            {puedeAgregar ? 'agregar al carrito' : 'sin stock'}
          </Button>
        </div>
      </div>
    </article>
  )
}