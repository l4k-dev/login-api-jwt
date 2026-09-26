function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-gray-900">
            MinhaApp
          </p>

          <p className="mt-1 text-sm text-gray-500">
            React + TypeScript + Tailwind
          </p>
        </div>

        <p className="text-sm text-gray-500">
          © 2026 MinhaApp. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer