import { useState } from 'react'

const initialForm = {
	name: '',
	email: '',
	password: '',
	confirmPassword: '',
}

function Register({ onSwitchToLogin }) {
	const [formData, setFormData] = useState(initialForm)
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')

	const handleChange = ({ target }) => {
		const { name, value } = target
		setFormData((current) => ({
			...current,
			[name]: value,
		}))
	}

	const handleSubmit = (event) => {
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

		if (!formData.email.includes('@')) {
			setError('Introduce un correo valido.')
			return
		}

		if (formData.password.length < 6) {
			setError('La contrasena debe tener al menos 6 caracteres.')
			return
		}

		if (formData.password !== formData.confirmPassword) {
			setError('Las contrasenas no coinciden.')
			return
		}

		setMessage(`Cuenta creada para ${formData.name}. Ya puedes iniciar sesion.`)
		setFormData(initialForm)
	}

	return (
		<div className="flex w-full items-center justify-center rounded-[1.6rem] border border-[--line] bg-[linear-gradient(180deg,rgba(255,252,246,0.92),rgba(242,232,215,0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] md:p-6">
			<div className="w-full max-w-md rounded-[1.8rem] border border-[rgba(109,78,52,0.16)] bg-[rgba(255,251,245,0.86)] p-8 shadow-[0_20px_40px_rgba(73,48,29,0.14)] backdrop-blur">
				<div className="mb-8">
					<p className="text-xs font-semibold uppercase tracking-[0.35em] text-[--accent]">
						Vinacoteca
					</p>
					<h1 className="mt-3 text-3xl leading-tight text-[--ink]">Crear cuenta</h1>
					<p className="mt-2 text-sm leading-6 text-[--muted]">
						Registra tu acceso para empezar a gestionar tu bodega.
					</p>
				</div>

				<form className="space-y-5" onSubmit={handleSubmit}>
					<label className="block text-sm font-medium text-[--wood-dark]" htmlFor="name">
						Nombre
						<input
							id="name"
							name="name"
							type="text"
							value={formData.name}
							onChange={handleChange}
							placeholder="Tu nombre"
							className="mt-2 w-full rounded-[1.1rem] border border-[rgba(120,85,56,0.22)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-[--ink] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[--accent] focus:ring-2 focus:ring-[rgba(169,117,59,0.18)]"
						/>
					</label>

					<label className="block text-sm font-medium text-[--wood-dark]" htmlFor="register-email">
						Correo electronico
						<input
							id="register-email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="nombre@correo.com"
							className="mt-2 w-full rounded-[1.1rem] border border-[rgba(120,85,56,0.22)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-[--ink] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[--accent] focus:ring-2 focus:ring-[rgba(169,117,59,0.18)]"
						/>
					</label>

					<div className="grid gap-5 md:grid-cols-2">
						<label className="block text-sm font-medium text-[--wood-dark]" htmlFor="register-password">
							Contrasena
							<input
								id="register-password"
								name="password"
								type="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Minimo 6 caracteres"
								className="mt-2 w-full rounded-[1.1rem] border border-[rgba(120,85,56,0.22)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-[--ink] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[--accent] focus:ring-2 focus:ring-[rgba(169,117,59,0.18)]"
							/>
						</label>

						<label className="block text-sm font-medium text-[--wood-dark]" htmlFor="confirmPassword">
							Repetir contrasena
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								value={formData.confirmPassword}
								onChange={handleChange}
								placeholder="Repite tu clave"
								className="mt-2 w-full rounded-[1.1rem] border border-[rgba(120,85,56,0.22)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-[--ink] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[--accent] focus:ring-2 focus:ring-[rgba(169,117,59,0.18)]"
							/>
						</label>
					</div>

					{error ? (
						<p className="rounded-[1.1rem] border border-red-200 bg-[rgba(126,31,17,0.08)] px-4 py-3 text-sm text-red-800">
							{error}
						</p>
					) : null}

					{message ? (
						<p className="rounded-[1.1rem] border border-emerald-200 bg-[rgba(79,102,74,0.1)] px-4 py-3 text-sm text-emerald-900">
							{message}
						</p>
					) : null}

					<button
						type="submit"
						className="w-full rounded-[1.1rem] bg-[linear-gradient(180deg,#7d5737,#5d3c26)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[--paper] transition hover:brightness-105"
					>
						Crear cuenta
					</button>

					<p className="text-center text-sm text-[--muted]">
						Ya tienes cuenta?{' '}
						<button
							type="button"
							onClick={onSwitchToLogin}
							className="font-semibold text-[--accent] underline decoration-transparent transition hover:decoration-current"
						>
							Inicia sesion aqui
						</button>
					</p>
				</form>
			</div>
		</div>
	)
}

export default Register
