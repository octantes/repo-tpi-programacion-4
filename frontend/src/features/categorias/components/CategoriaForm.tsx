import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import type { Categoria, CategoriaPayload } from '../types'

interface CategoriaFormProps {
  initial?: Categoria
  onSubmit: (values: CategoriaPayload) => Promise<void>
  onCancel: () => void
}

export function CategoriaForm({ initial, onSubmit, onCancel }: CategoriaFormProps) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      nombre: initial?.nombre ?? '',
      descripcion: initial?.descripcion ?? '',
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
      <form.Field name="descripcion">
        {(field) => (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700" htmlFor="categoria-descripcion">
              descripcion
            </label>
            <textarea
              id="categoria-descripcion"
              className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
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