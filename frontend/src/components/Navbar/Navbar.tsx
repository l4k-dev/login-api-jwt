import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          MinhaApp
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Home
          </Link>

          <Link
            to="/About"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Começar
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar