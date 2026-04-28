import Footer from './footer'
import Header from './header'

function Layout({ children }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(73,49,31,0.05),_rgba(73,49,31,0.01)),radial-gradient(circle_at_top,_rgba(162,117,74,0.18),_transparent_34%)] px-4 py-5 text-[--ink] md:px-8 md:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.88fr_1.3fr] lg:items-start">
        <div className="space-y-5 lg:sticky lg:top-6">
          <Header />
          <Footer />
        </div>

        <div className="min-w-0 rounded-[1.5rem] border border-[--line] bg-[rgba(248,242,230,0.86)] p-4 shadow-[0_20px_50px_rgba(55,33,18,0.14)] backdrop-blur md:p-6">
          {children}
        </div>
      </div>
    </main>
  )
}

export default Layout
