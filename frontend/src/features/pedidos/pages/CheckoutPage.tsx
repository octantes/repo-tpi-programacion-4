import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { formatCurrency } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks'
import type { FormaPago } from '../types'

export function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const vaciar = useCartStore((state) => state.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      if (items.length === 0) {
        setError('el carrito esta vacio')
        return
      }
      try {
        await crearPedido.mutateAsync({
          items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega,
          notas: value.notas.trim() ? value.notas.trim() : undefined,
        })
        vaciar()
        navigate('/mis-pedidos', { replace: true })
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })
  if (items.length === 0) {
    return (
      <EstadoVacio title="no hay productos para confirmar" message="vuelve al catalogo y agrega productos al carrito.">
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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length < 5 ? 'ingresa una direccion de al menos 5 caracteres' : undefined,
              }}
            >
              {(field) => (
                <Input
                  label="direccion de entrega"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
                />
              )}
            </form.Field>
            <form.Field name="forma_pago">
              {(field) => (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="forma-pago">
                    forma de pago
                  </label>
                  <select
                    id="forma-pago"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value as FormaPago)}
                    onBlur={field.handleBlur}
                  >
                    <option value="EFECTIVO">efectivo</option>
                    <option value="TRANSFERENCIA">transferencia</option>
                  </select>
                </div>
              )}
            </form.Field>
            <form.Field
              name="notas"
              validators={{
                onChange: ({ value }) => (value.length > 500 ? 'maximo 500 caracteres' : undefined),
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="notas">
                    notas opcionales
                  </label>
                  <textarea
                    id="notas"
                    className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-xs font-medium text-red-600">{String(field.state.meta.errors[0])}</p>
                  ) : null}
                </div>
              )}
            </form.Field>
            {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" loading={isSubmitting} className="w-full">
                  crear pedido
                </Button>
              )}
            </form.Subscribe>
          </form>
        </Card>
        <Card className="h-fit">
          <h2 className="text-lg font-bold text-slate-900">tu pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.producto_id} className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{item.nombre}</p>
                  <p className="text-slate-500">x{item.cantidad}</p>
                </div>
                <p className="font-semibold text-slate-700">{formatCurrency(item.precio_unitario * item.cantidad)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-semibold text-slate-700">total</span>
            <span className="text-2xl font-black text-orange-600">{formatCurrency(total())}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}