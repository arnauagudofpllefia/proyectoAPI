import Footer from './footer'
import Header from './header'

function Layout({ children }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(68,44,29,0.08),_rgba(68,44,29,0.02)),radial-gradient(circle_at_top,_rgba(140,98,57,0.2),_transparent_30%)] px-4 py-5 text-[--ink] md:px-8 md:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.25fr] lg:items-start">
        <div className="space-y-6 lg:sticky lg:top-6">
          <Header />
          <Footer />
        </div>

        <div className="min-w-0 rounded-[2rem] border border-[--line] bg-[rgba(248,242,230,0.82)] p-4 shadow-[0_24px_80px_rgba(55,33,18,0.18)] backdrop-blur md:p-6">
          {children}
        </div>
      </div>
    </main>
  )
}

export default Layout
