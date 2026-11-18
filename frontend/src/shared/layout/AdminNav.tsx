import { NavLink } from 'react-router-dom'

const enlaces = [
  { to: '/admin/resumen', label: 'resumen' },
  { to: '/admin/categorias', label: 'categorias' },
  { to: '/admin/productos', label: 'productos' },
  { to: '/admin/pedidos', label: 'pedidos' },
  { to: '/admin/usuarios', label: 'usuarios' },
]

export function AdminNav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {enlaces.map((enlace) => (
        <NavLink
          key={enlace.to}
          to={enlace.to}
          className={({ isActive }) =>
            `rounded-xl px-3 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          {enlace.label}
        </NavLink>
      ))}
    </nav>
  )
}