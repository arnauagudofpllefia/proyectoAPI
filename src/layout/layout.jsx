import Footer from './footer'
import Header from './header'

function Layout({ children }) {
	return (
		<main className="min-h-screen bg-[linear-gradient(180deg,_rgba(68,44,29,0.08),_rgba(68,44,29,0.02)),radial-gradient(circle_at_top,_rgba(140,98,57,0.2),_transparent_30%)] px-6 py-8 text-[--ink] md:px-10 md:py-10">
			<div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 overflow-hidden rounded-[2rem] border border-[--line] bg-[rgba(248,242,230,0.82)] p-5 shadow-[0_24px_80px_rgba(55,33,18,0.18)] backdrop-blur md:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
				<div className="flex flex-col gap-6 lg:min-h-full">
					<Header />
					<Footer />
				</div>

				<div className="flex items-stretch">{children}</div>
			</div>
		</main>
	)
}

export default Layout
