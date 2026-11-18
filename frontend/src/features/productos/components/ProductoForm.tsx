import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import type { Categoria } from '../../categorias'
import type { Producto, ProductoPayload } from '../types'

interface ProductoFormProps {
  initial?: Producto
  categorias: Categoria[]
  onSubmit: (values: ProductoPayload) => Promise<void>
  onCancel: () => void
}

export function ProductoForm({ initial, categorias, onSubmit, onCancel }: ProductoFormProps) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      categoria_id: initial?.categoria_id ?? categorias[0]?.id ?? 0,
      nombre: initial?.nombre ?? '',
      descripcion: initial?.descripcion ?? '',
      precio_base: initial?.precio_base ?? 0,
      imagen_url: initial?.imagen_url ?? '',
      stock: initial?.stock ?? 0,
      disponible: initial?.disponible ?? true,
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
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => (value.trim().length < 2 ? 'minimo 2 caracteres' : undefined),
        }}
      >
        {(field) => (
          <Input
            label="nombre"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
          />
        )}
      </form.Field>
      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value < 1 ? 'selecciona una categoria' : undefined),
        }}
      >
        {(field) => (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700" htmlFor="producto-categoria">
              categoria
            </label>
            <select
              id="producto-categoria"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              value={field.state.value}
              onChange={(event) => field.handleChange(Number(event.target.value))}
              onBlur={field.handleBlur}
            >
              <option value={0}>selecciona una categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {field.state.meta.errors.length > 0 ? (
              <p className="text-xs font-medium text-red-600">{String(field.state.meta.errors[0])}</p>
            ) : null}
          </div>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700" htmlFor="producto-descripcion">
              descripcion
            </label>
            <textarea
              id="producto-descripcion"
              className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => (value < 0 ? 'el precio no puede ser negativo' : undefined),
          }}
        >
          {(field) => (
            <Input
              label="precio base"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onChange={(event) => field.handleChange(Number(event.target.value))}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
            />
          )}
        </form.Field>
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
      </div>
      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="imagen url"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
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
              guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}