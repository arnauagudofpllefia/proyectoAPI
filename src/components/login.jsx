import { useState } from 'react'

const initialForm = {
	email: 'arnau@gmail.com',
	password: 'arnau123',
}

function Login({ onSwitchToRegister }) {
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

		if (!formData.email.trim() || !formData.password.trim()) {
			setError('Completa el correo y la contraseña.')
			return
		}

		if (!formData.email.includes('@')) {
			setError('Introduce un correo valido.')
			return
		}

		setMessage(`Sesion iniciada como ${formData.email}.`)
		setFormData(initialForm)
	}

	return (
		<div className="flex w-full items-center justify-center rounded-[1.6rem] border border-[--line] bg-[linear-gradient(180deg,rgba(255,252,246,0.92),rgba(242,232,215,0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] md:p-6">
			<div className="w-full max-w-md rounded-[1.8rem] border border-[rgba(109,78,52,0.16)] bg-[rgba(255,251,245,0.86)] p-8 shadow-[0_20px_40px_rgba(73,48,29,0.14)] backdrop-blur">
			<div className="mb-8">
				<p className="text-xs font-semibold uppercase tracking-[0.35em] text-[--accent]">
					Vinacoteca
				</p>
				<h1 className="mt-3 text-3xl leading-tight text-[--ink]">Iniciar sesion</h1>
				<p className="mt-2 text-sm leading-6 text-[--muted]">
					Accede con tu correo y contrasena para continuar.
				</p>
			</div>

			<form className="space-y-5" onSubmit={handleSubmit}>
				<label className="block text-sm font-medium text-[--wood-dark]" htmlFor="email">
					Correo electronico
					<input
						id="email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="nombre@correo.com"
						className="mt-2 w-full rounded-[1.1rem] border border-[rgba(120,85,56,0.22)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-[--ink] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[--accent] focus:ring-2 focus:ring-[rgba(169,117,59,0.18)]"
					/>
				</label>

				<label className="block text-sm font-medium text-[--wood-dark]" htmlFor="password">
					Contrasena
					<input
						id="password"
						name="password"
						type="password"
						value={formData.password}
						onChange={handleChange}
						placeholder="••••••••"
						className="mt-2 w-full rounded-[1.1rem] border border-[rgba(120,85,56,0.22)] bg-[rgba(255,250,242,0.9)] px-4 py-3 text-[--ink] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[--accent] focus:ring-2 focus:ring-[rgba(169,117,59,0.18)]"
					/>
				</label>

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
					Entrar
				</button>

				<p className="text-center text-sm text-[--muted]">
					No tienes cuenta?{' '}
					<button
						type="button"
						onClick={onSwitchToRegister}
						className="font-semibold text-[--accent] underline decoration-transparent transition hover:decoration-current"
					>
						Registrate aqui
					</button>
				</p>
			</form>
			</div>
		</div>
	)
}

export default Login
