import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function resolveRouteByRole(role = 'user') {
  if (role === 'admin') {
    return '/dashboard/admin'
  }

  if (role === 'editor') {
    return '/dashboard/editor'
  }

  return '/pedidos'
}

function Login({ onSwitchToRegister }) {
  const { loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = ({ target }) => {
    const { name, value } = target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Completa el correo y la contraseña.')
      return
    }

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      })

      navigate(location.state?.from || resolveRouteByRole(result.user?.role), { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <div className="panel w-full max-w-2xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[--accent]">Vinacoteca</p>
        <h2 className="mt-3 text-3xl leading-tight text-[--ink]">Iniciar sesión</h2>
        <p className="mt-2 text-sm leading-6 text-[--muted]">
          Accede con tu correo y contraseña para usar pedidos, perfil y dashboards por rol.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="label" htmlFor="email">
          Correo electrónico
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nombre@correo.com"
          />
        </label>

        <label className="label" htmlFor="password">
          Contraseña
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </label>

        {error ? <p className="status-note status-note--error">{error}</p> : null}

        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-[--muted]">
          ¿No tienes cuenta?{' '}
          <button className="font-semibold text-[--accent]" onClick={onSwitchToRegister} type="button">
            Regístrate aquí
          </button>
        </p>
      </form>
    </div>
  )
}

export default Login
