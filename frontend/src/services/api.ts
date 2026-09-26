const API_URL = 'http://localhost:5000/api'

export interface Usuario {
    id: number
    nome: string
    email: string
    nivel: string
}

export interface LoginResponse {
    mensagem: string
    usuario: Usuario
}

export interface LoginResultado {
    confirmacaoNecessaria?: boolean
    mensagem: string
    usuario: Usuario
    tokenConfirmacao?: string
}

export async function login(
    email: string,
    senha: string
): Promise<LoginResultado> {
    try {
        const response = await fetch(`${API_URL}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email,
                senha,
            }),
        })

        if (response.status === 429) {
            throw new Error('RATE_LIMIT')
        }

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
                data.mensagem || 'E-mail ou senha inválidos.'
            )
        }

        return data
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message === 'RATE_LIMIT' ||
                error.message === 'E-mail ou senha inválidos.'
            ) {
                throw error
            }
        }

        throw new Error('Erro ao acessar servidor')
    }
}

export async function confirmarDispositivo(
    tokenConfirmacao: string,
    codigo: string
): Promise<LoginResponse> {
    try {
        const response = await fetch(
            `${API_URL}/Auth/confirmar-dispositivo`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    tokenConfirmacao,
                    codigo,
                }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
                data.mensagem ||
                'Código de confirmação inválido ou expirado.'
            )
        }

        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }

        throw new Error('Erro ao acessar servidor')
    }
}