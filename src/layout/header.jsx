import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getLinkClassName({ isActive }) {
  return isActive
    ? 'rounded-full bg-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100'
    : 'rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-200/85 transition hover:bg-white/10'
}

function Header() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <header className="relative overflow-hidden rounded-[1.6rem] border border-[rgba(109,78,52,0.18)] bg-[linear-gradient(180deg,rgba(93,62,40,0.96),rgba(58,38,25,0.98))] px-6 py-7 text-stone-100 md:px-8 md:py-8">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_22px,rgba(255,255,255,0.03)_23px)] opacity-70" />
      <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-[rgba(198,158,104,0.12)] blur-2xl" />
      <div className="absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />

      <div className="relative z-10 flex h-full flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-amber-200/90">Vinacoteca</p>
          <h2 className="mt-4 max-w-xl text-4xl leading-tight md:text-5xl">Gestión simple de catálogo y pedidos</h2>
        </div>

        <nav className="flex flex-wrap gap-2">
          <NavLink className={getLinkClassName} to="/">
            Inicio
          </NavLink>
          <NavLink className={getLinkClassName} to="/catalogo">
            Catálogo
          </NavLink>
          <NavLink className={getLinkClassName} to="/pedidos">
            Pedidos
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink className={getLinkClassName} to="/perfil">
                Perfil
              </NavLink>
              {['editor', 'admin'].includes(user?.role) ? (
                <NavLink className={getLinkClassName} to="/dashboard/editor">
                  Dashboard editor
                </NavLink>
              ) : null}
              {user?.role === 'admin' ? (
                <NavLink className={getLinkClassName} to="/dashboard/admin">
                  Dashboard admin
                </NavLink>
              ) : null}
            </>
          ) : (
            <NavLink className={getLinkClassName} to="/login">
              Login
            </NavLink>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-[rgba(255,255,255,0.06)] px-4 py-3 text-sm">
          {isAuthenticated ? (
            <>
              <p>
                Conectado como <strong>{user?.name || user?.email}</strong> · rol <strong>{user?.role}</strong>
              </p>
              <button className="btn-secondary border-white/15 text-white hover:bg-white/10" onClick={logout} type="button">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <p>Inicia sesión para acceder a pedidos y paneles.</p>
              <Link className="btn-secondary border-white/15 text-white hover:bg-white/10" to="/login">
                Ir al acceso
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
