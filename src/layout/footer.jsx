import { API_BASE_URL } from '../services/api'

function Footer() {
  return (
    <footer className="flex flex-col gap-4 rounded-[1.2rem] border border-[--line] bg-[rgba(255,248,238,0.74)] px-5 py-4 text-sm text-[--muted]">
      <p>
        Panel conectado a la API con autenticación JWT y gestión por roles.
      </p>

      <div className="rounded-[0.9rem] bg-[rgba(255,255,255,0.5)] px-4 py-3 text-xs text-[--wood-dark]">
        <p className="font-semibold uppercase tracking-[0.2em] text-[--accent]">API</p>
        <p className="mt-1 break-all">{API_BASE_URL}</p>
      </div>
    </footer>
  )
}

export default Footer
