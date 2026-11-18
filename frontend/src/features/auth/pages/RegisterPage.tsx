import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'
import { registerRequest } from '../api'

export function RegisterPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registerRequest(value)
        await login(value.username, value.password)
        navigate('/', { replace: true })
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-orange-100 bg-white p-8 shadow-xl">
        <Link to="/" className="text-2xl font-black text-orange-600">
          food store
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">registrate para armar y confirmar tus pedidos.</p>
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
              onChange: ({ value }) => (value.trim().length < 3 ? 'minimo 3 caracteres' : undefined),
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
            name="full_name"
            validators={{
              onChange: ({ value }) => (value.trim().length < 2 ? 'ingresa tu nombre completo' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="nombre completo"
                autoComplete="name"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'ingresa un email valido' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="email"
                type="email"
                autoComplete="email"
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
              onChange: ({ value }) => (value.length < 8 ? 'minimo 8 caracteres' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="contraseña"
                type="password"
                autoComplete="new-password"
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
                crear cuenta
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          ya tenes cuenta?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
            inicia sesion
          </Link>
        </p>
      </div>
    </div>
  )
}