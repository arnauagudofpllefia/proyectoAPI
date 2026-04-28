import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  photo: null,
}

function Register({ onSwitchToLogin }) {
  const { loading, register } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const resolveRegisterError = (submitError) => {
    const raw = String(submitError?.message || '').toLowerCase()

    if (submitError?.status === 404) {
      return 'No se encontró el endpoint de registro. Asegúrate de usar el frontend en Vite dev (proxy) o una API accesible.'
    }

    if (submitError?.status === 0) {
      return 'No se pudo conectar con la API. Comprueba conexión, CORS o proxy de Vite.'
    }

    if (raw.includes('imatge') || raw.includes('imagen') || raw.includes('obligatoria')) {
      return 'La imagen de perfil es obligatoria para registrarte.'
    }

    if (raw.includes('registrat') || raw.includes('registrado') || raw.includes('ja està')) {
      return 'Ese correo ya está registrado.'
    }

    return submitError?.message || 'No se pudo completar el registro.'
  }

  const handleChange = ({ target }) => {
    const { files, name, value } = target

    setFormData((current) => ({
      ...current,
      [name]: files ? files[0] || null : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setError('Completa todos los campos del registro.')
      return
    }

    if (!formData.photo) {
      setError('Selecciona una foto de perfil para cumplir el flujo del proyecto.')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Introduce un correo válido.')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        photo: formData.photo,
      })

      setMessage('Cuenta creada correctamente. Ya puedes iniciar sesión.')
      setFormData(initialForm)
      onSwitchToLogin()
    } catch (submitError) {
      setError(resolveRegisterError(submitError))
    }
  }

  return (
    <div className="panel w-full max-w-2xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[--accent]">Vinacoteca</p>
        <h2 className="mt-3 text-3xl leading-tight text-[--ink]">Crear cuenta</h2>
        <p className="mt-2 text-sm leading-6 text-[--muted]">
          El alta envía email, contraseña e imagen mediante `multipart/form-data` para conectar con tu API.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="label" htmlFor="name">
          Nombre
          <input
            className="input"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre"
          />
        </label>

        <label className="label" htmlFor="register-email">
          Correo electrónico
          <input
            className="input"
            id="register-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nombre@correo.com"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="label" htmlFor="register-password">
            Contraseña
            <input
              className="input"
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
            />
          </label>

          <label className="label" htmlFor="confirmPassword">
            Repetir contraseña
            <input
              className="input"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu clave"
            />
          </label>
        </div>

        <label className="label" htmlFor="photo">
          Foto de perfil
          <input className="input" id="photo" name="photo" type="file" accept="image/*" onChange={handleChange} />
        </label>

        {error ? <p className="status-note status-note--error">{error}</p> : null}
        {message ? <p className="status-note status-note--success">{message}</p> : null}

        <p className="text-xs leading-5 text-[--muted]">
          Tu backend no guarda el nombre en el registro actual; el frontend usará el email como identificador visible si hace falta.
        </p>

        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-[--muted]">
          ¿Ya tienes cuenta?{' '}
          <button className="font-semibold text-[--accent]" onClick={onSwitchToLogin} type="button">
            Inicia sesión aquí
          </button>
        </p>
      </form>
    </div>
  )
}

export default Register
