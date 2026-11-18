import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export function Navbar() {
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const items = useCartStore((state) => state.items)
  const navigate = useNavigate()
  const cantidad = items.reduce((total, item) => total + item.cantidad, 0)
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-black tracking-tight text-orange-600">
          food store
        </Link>
        <div className="flex flex-1 flex-wrap items-center gap-4 text-sm font-semibold">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-900')}
          >
            catalogo
          </NavLink>
          <NavLink
            to="/carrito"
            className={({ isActive }) => (isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-900')}
          >
            carrito ({cantidad})
          </NavLink>
          {usuario ? (
            <NavLink
              to="/mis-pedidos"
              className={({ isActive }) => (isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-900')}
            >
              mis pedidos
            </NavLink>
          ) : null}
          {usuario?.role === 'admin' ? (
            <NavLink
              to="/admin/resumen"
              className={({ isActive }) => (isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-900')}
            >
              panel
            </NavLink>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {usuario ? (
            <>
              <div className="text-right">
                <p className="font-semibold text-slate-800">{usuario.full_name}</p>
                <p className="text-xs tracking-wide text-slate-500">{usuario.role}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                onClick={() => void handleLogout()}
              >
                cerrar sesion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100">
                ingresar
              </Link>
              <Link to="/register" className="rounded-lg bg-orange-600 px-3 py-2 font-semibold text-white hover:bg-orange-700">
                registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}