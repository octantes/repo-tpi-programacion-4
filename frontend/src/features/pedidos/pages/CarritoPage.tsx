import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { formatCurrency } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((state) => state.items)
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
  const quitar = useCartStore((state) => state.quitar)
  const vaciar = useCartStore((state) => state.vaciar)
  const total = useCartStore((state) => state.total)
  const subtotal = total()
  if (items.length === 0) {
    return (
      <EstadoVacio title="tu carrito esta vacio" message="agrega productos del catalogo para comenzar un pedido.">
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
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">carrito</h1>
        <button type="button" className="text-sm font-semibold text-red-600 hover:text-red-700" onClick={vaciar}>
          vaciar carrito
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.producto_id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-48 flex-1">
                <p className="font-semibold text-slate-900">{item.nombre}</p>
                <p className="text-sm text-slate-500">{formatCurrency(item.precio_unitario)} por unidad</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 rounded-lg border border-slate-200 font-bold text-slate-600 hover:bg-slate-100"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.cantidad}
                  onChange={(event) => cambiarCantidad(item.producto_id, Number(event.target.value))}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm"
                />
                <button
                  type="button"
                  className="h-9 w-9 rounded-lg border border-slate-200 font-bold text-slate-600 hover:bg-slate-100"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </button>
              </div>
              <div className="min-w-32 text-right">
                <p className="font-bold text-slate-900">{formatCurrency(item.precio_unitario * item.cantidad)}</p>
                <button
                  type="button"
                  className="mt-1 text-xs font-semibold text-red-600 hover:text-red-700"
                  onClick={() => quitar(item.producto_id)}
                >
                  quitar
                </button>
              </div>
            </div>
          ))}
        </div>
        <Card className="h-fit">
          <h2 className="text-lg font-bold text-slate-900">resumen</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>productos</span>
            <span>{items.reduce((acumulado, item) => acumulado + item.cantidad, 0)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="font-semibold text-slate-700">total</span>
            <span className="text-2xl font-black text-orange-600">{formatCurrency(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-5 block rounded-lg bg-orange-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-700"
          >
            confirmar pedido
          </Link>
          <Link to="/" className="mt-3 block text-center text-sm font-medium text-slate-500 hover:text-slate-700">
            seguir comprando
          </Link>
        </Card>
      </div>
    </div>
  )
}