import { formatCurrency } from '../../../shared/utils/format'
import type { DetallePedido as DetallePedidoType, Pedido } from '../types'

interface DetallePedidoProps {
  pedido: Pick<Pedido, 'items' | 'total'>
}

export function DetallePedido({ pedido }: DetallePedidoProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">producto</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">precio</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">cantidad</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {pedido.items.map((item: DetallePedidoType) => (
              <tr key={item.producto_id}>
                <td className="px-3 py-2 text-slate-800">{item.nombre_producto}</td>
                <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.precio_unitario)}</td>
                <td className="px-3 py-2 text-right text-slate-600">{item.cantidad}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end text-sm">
        <p className="font-semibold text-slate-800">
          total: <span className="text-lg text-orange-600">{formatCurrency(pedido.total)}</span>
        </p>
      </div>
    </div>
  )
}