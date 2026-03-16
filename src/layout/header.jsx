function Header() {
	return (
		<header className="relative overflow-hidden rounded-[1.6rem] border border-[rgba(109,78,52,0.18)] bg-[linear-gradient(180deg,rgba(93,62,40,0.94),rgba(58,38,25,0.96))] px-8 py-10 text-stone-100">
			<div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_22px,rgba(255,255,255,0.03)_23px)] opacity-70" />
			<div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-[rgba(198,158,104,0.12)] blur-2xl" />
			<div className="absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />

			<div className="relative z-10 flex h-full flex-col justify-between gap-12">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.42em] text-amber-200/90">
						Bodega rural
					</p>
					<h2 className="mt-5 max-w-lg text-4xl leading-tight md:text-5xl">
						Un acceso sereno, con el tono de madera vieja y luz de cosecha.
					</h2>
					<p className="mt-6 max-w-xl text-base leading-8 text-stone-200/80 md:text-lg">
						La interfaz mantiene un estilo calido y sobrio para una vinacoteca, con una
						presencia inspirada en barricas, piedra clara y etiquetas artesanas.
					</p>
				</div>

				<div className="grid gap-4 text-sm text-stone-200/85 md:grid-cols-3">
					<article className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Madera</p>
						<p className="mt-3 leading-6">Nogal, roble y tonos tostados para dar peso visual.</p>
					</article>
					<article className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Campo</p>
						<p className="mt-3 leading-6">Verdes apagados y fondos lino para una sensacion natural.</p>
					</article>
					<article className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Oficio</p>
						<p className="mt-3 leading-6">Detalles sobrios que encajan con una marca artesanal.</p>
					</article>
				</div>
			</div>
		</header>
	)
}

export default Header
