function Footer() {
	return (
		<footer className="flex flex-col gap-3 rounded-[1.35rem] border border-[--line] bg-[rgba(255,248,238,0.72)] px-5 py-4 text-sm text-[--muted] md:flex-row md:items-center md:justify-between">
			<p>Vinacoteca rural. Un espacio sobrio para gestionar tu bodega.</p>
			<div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-[--accent]">
				<span>Roble</span>
				<span className="h-1 w-1 rounded-full bg-[--accent]" />
				<span>Lino</span>
				<span className="h-1 w-1 rounded-full bg-[--accent]" />
				<span>Tierra</span>
			</div>
		</footer>
	)
}

export default Footer
