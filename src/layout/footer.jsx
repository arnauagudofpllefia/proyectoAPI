import { API_BASE_URL } from '../services/api'

function Footer() {
  return (
    <footer className="flex flex-col gap-4 rounded-[1.35rem] border border-[--line] bg-[rgba(255,248,238,0.72)] px-5 py-4 text-sm text-[--muted]">
      <p>
        Frontend React preparado para el proyecto IA3: catálogo público, auth JWT, pedidos y administración por roles.
      </p>

      <div className="rounded-[1rem] bg-[rgba(255,255,255,0.42)] px-4 py-3 text-xs text-[--wood-dark]">
        <p className="font-semibold uppercase tracking-[0.22em] text-[--accent]">Base URL detectada</p>
        <p className="mt-1 break-all">{API_BASE_URL}</p>
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-[--accent]">
        <span>JWT</span>
        <span className="h-1 w-1 rounded-full bg-[--accent]" />
        <span>CRUD</span>
        <span className="h-1 w-1 rounded-full bg-[--accent]" />
        <span>Uploads</span>
      </div>
    </footer>
  )
}

export default Footer
