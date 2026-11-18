import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username, value.password)
        navigate(from, { replace: true })
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-xl">
        <Link to="/" className="text-2xl font-black text-orange-600">
          food store
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">iniciar sesion</h1>
        <p className="mt-1 text-sm text-slate-500">accede para confirmar pedidos y ver tu historial.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (!value.trim() ? 'ingresa tu usuario' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? 'ingresa tu contraseña' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" loading={isSubmitting} className="w-full">
                ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          no tenes cuenta?{' '}
          <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700">
            registrate
          </Link>
        </p>
        <Link to="/" className="mt-3 block text-center text-sm font-medium text-slate-500 hover:text-slate-700">
          volver al catalogo
        </Link>
      </div>
    </div>
  )
}