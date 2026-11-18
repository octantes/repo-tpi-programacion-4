import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center">
      <h1 className="text-2xl font-bold text-amber-900">sin permiso</h1>
      <p className="mt-2 text-sm text-amber-800">tu cuenta no tiene acceso a esta seccion.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
      >
        volver al catalogo
      </Link>
    </div>
  )
}