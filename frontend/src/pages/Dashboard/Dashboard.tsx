import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  function handleLogout() { 
    localStorage.removeItem('token')
    navigate('/', { replace: true })
  }

  const fonteUI = { fontFamily: "'Space Grotesk', sans-serif" }
  const fonteDisplay = { fontFamily: "'Fraunces', serif" }

  return (
    <div className="flex h-screen bg-[#FAF7F1]" style={fonteUI}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,380..600&family=Space+Grotesk:wght@400;500;600;700&display=swap" />

      {/* Menu Lateral */}
      <aside className="hidden w-64 flex-col justify-between bg-[#241129] text-[#C9A8CE] md:flex">
        <div>
          <div className="flex items-center gap-3 border-b border-[#3A1E42] px-6 py-6">
            <div className="flex h-8 w-8 rotate-[-6deg] items-center justify-center bg-[#E8502B] text-sm font-semibold text-[#241129]">
              M
            </div>
            <h1 className="text-[15px] font-medium text-[#F3EEE9]">MeuApp</h1>
          </div>

          <nav className="mt-6 space-y-1 px-3">
            <a href="#" className="flex items-center border-l-2 border-[#E8502B] bg-[#2E1636] px-4 py-3 text-sm font-medium text-[#F3EEE9]">
              Visão Geral
            </a>

            <a href="#" className="flex items-center border-l-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:border-[#5C2E68] hover:text-[#F3EEE9]">
              Usuários
            </a>

            <a href="#" className="flex items-center border-l-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:border-[#5C2E68] hover:text-[#F3EEE9]">
              Relatórios
            </a>

            <a href="#" className="flex items-center border-l-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:border-[#5C2E68] hover:text-[#F3EEE9]">
              Configurações
            </a>
          </nav>
        </div>

        <div className="border-t border-[#3A1E42] p-4 text-center text-xs text-[#8A6E92]">
          v1.0.0 · Painel Administrativo
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Barra Superior */}
        <header className="flex h-16 items-center justify-between border-b border-[#E7E1D8] bg-[#FAF7F1] px-6">
          <h2 className="text-lg text-[#1C1B1F]" style={fonteDisplay}>Dashboard</h2>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#8A8390]">Olá, Administrador</span>

            <div className="flex h-9 w-9 rotate-[-6deg] items-center justify-center bg-[#241129] text-sm font-semibold text-[#F3EEE9]">
              AD
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="border border-[#E8502B] px-4 py-2 text-sm font-medium text-[#E8502B] transition-colors hover:bg-[#E8502B] hover:text-[#FAF7F1]"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Corpo da Página */}
        <main className="flex-1 overflow-y-auto p-6">

          <div className="mb-8">
            <h3 className="text-2xl text-[#1C1B1F]" style={fonteDisplay}>Bem-vindo ao sistema.</h3>
            <p className="mt-1 text-sm text-[#8A8390]">Aqui está um resumo das principais atividades de hoje.</p>
          </div>

          {/* Faixa de estatísticas */}
          <div className="mb-8 grid grid-cols-1 divide-y divide-[#E7E1D8] border border-[#E7E1D8] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            <div className="p-6">
              <span className="text-xs font-medium text-[#8A8390]">Usuários Ativos</span>
              <p className="mt-2 text-3xl text-[#1C1B1F]" style={fonteDisplay}>1.245</p>
              <span className="mt-1 inline-block text-xs font-medium text-[#1F8A5C]">+12% este mês</span>
            </div>

            <div className="p-6">
              <span className="text-xs font-medium text-[#8A8390]">Receita Total</span>
              <p className="mt-2 text-3xl text-[#1C1B1F]" style={fonteDisplay}>R$ 45.890</p>
              <span className="mt-1 inline-block text-xs font-medium text-[#1F8A5C]">+5,4% esta semana</span>
            </div>

            <div className="p-6">
              <span className="text-xs font-medium text-[#8A8390]">Tarefas Pendentes</span>
              <p className="mt-2 text-3xl text-[#1C1B1F]" style={fonteDisplay}>8</p>
              <span className="mt-1 inline-block text-xs font-medium text-[#B8551F]">Atenção necessária</span>
            </div>

          </div>

          {/* Área de Gráfico/Tabela Simulado */}
          <div className="border border-[#E7E1D8] bg-white p-6">
            <h4 className="mb-4 text-base font-medium text-[#1C1B1F]">Atividade Recente</h4>
            <div className="flex h-48 items-center justify-center border border-dashed border-[#E7E1D8] text-sm text-[#B0AAA0]">
              Espaço reservado para gráficos ou tabelas
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default Dashboard