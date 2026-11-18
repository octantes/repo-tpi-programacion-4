import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import type { Producto, ProductoStockPayload } from '../types'

interface StockFormProps {
  producto: Producto
  onSubmit: (values: ProductoStockPayload) => Promise<void>
  onCancel: () => void
}

export function StockForm({ producto, onSubmit, onCancel }: StockFormProps) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      stock: producto.stock,
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await onSubmit(value)
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <p className="text-sm text-slate-600">
        producto: <span className="font-semibold text-slate-900">{producto.nombre}</span>
      </p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => (value < 0 ? 'el stock no puede ser negativo' : undefined),
        }}
      >
        {(field) => (
          <Input
            label="stock"
            type="number"
            min={0}
            step={1}
            value={field.state.value}
            onChange={(event) => field.handleChange(Number(event.target.value))}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(event) => field.handleChange(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-600"
            />
            disponible para la venta
          </label>
        )}
      </form.Field>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          cancelar
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" loading={isSubmitting}>
              actualizar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}