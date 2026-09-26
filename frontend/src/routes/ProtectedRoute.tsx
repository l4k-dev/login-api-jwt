import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [autenticado, setAutenticado] = useState<boolean | null>(null)

  useEffect(() => {
    async function verificarAutenticacao() {
      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        )

        if (response.ok) {
          setAutenticado(true)
        } else {
          setAutenticado(false)
        }
      } catch {
        setAutenticado(false)
      }
    }

    verificarAutenticacao()
  }, [])

  // Enquanto verifica o cookie
  if (autenticado === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    )
  }

  // Não autenticado
  if (!autenticado) {
    return <Navigate to="/" replace />
  }

  // Autenticado
  return children
}

export default ProtectedRoute