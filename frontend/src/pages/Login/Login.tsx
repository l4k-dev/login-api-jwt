import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    confirmarDispositivo,
    login,
} from '../../services/api'

/*
 * Paleta e tipografia carregadas uma única vez.
 * Se preferir, mova este <link> para o <head> do index.html.
 */
function CarregarFontes() {
    return (
        <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,380..600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap"
        />
    )
}

/*
 * Painel de identidade — o mesmo em ambas as telas, com
 * pequenas variações de texto conforme o estado do fluxo.
 */
function PainelIdentidade({
    etapa,
}: {
    etapa: 'login' | 'confirmacao'
}) {
    return (
        <aside className="relative hidden overflow-hidden bg-[#241129] px-12 py-14 text-[#F3EEE9] md:flex md:w-[44%] md:flex-col md:justify-between lg:px-16">
            {/* Textura de fundo: rede de nós, remete a verificação/segurança */}
            <svg
                aria-hidden="true"
                viewBox="0 0 600 900"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
            >
                <defs>
                    <radialGradient id="fade" cx="50%" cy="35%" r="75%">
                        <stop offset="0%" stopColor="#5C2E68" />
                        <stop offset="100%" stopColor="#241129" />
                    </radialGradient>
                </defs>
                <rect width="600" height="900" fill="url(#fade)" />
                {[
                    [80, 120], [220, 80], [360, 160], [500, 100],
                    [120, 300], [280, 260], [430, 320], [540, 260],
                    [70, 480], [240, 440], [400, 500], [520, 460],
                    [140, 660], [300, 620], [460, 680],
                    [90, 820], [260, 800], [420, 840],
                ].map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={i % 5 === 0 ? 3.5 : 2}
                        fill="#E8502B"
                        opacity={i % 3 === 0 ? 0.9 : 0.4}
                    />
                ))}
                <g stroke="#E8502B" strokeWidth="0.6" opacity="0.35">
                    <line x1="80" y1="120" x2="220" y2="80" />
                    <line x1="220" y1="80" x2="360" y2="160" />
                    <line x1="360" y1="160" x2="500" y2="100" />
                    <line x1="120" y1="300" x2="280" y2="260" />
                    <line x1="280" y1="260" x2="430" y2="320" />
                    <line x1="430" y1="320" x2="540" y2="260" />
                    <line x1="220" y1="80" x2="280" y2="260" />
                    <line x1="360" y1="160" x2="430" y2="320" />
                    <line x1="70" y1="480" x2="240" y2="440" />
                    <line x1="240" y1="440" x2="400" y2="500" />
                    <line x1="400" y1="500" x2="520" y2="460" />
                    <line x1="140" y1="660" x2="300" y2="620" />
                    <line x1="300" y1="620" x2="460" y2="680" />
                    <line x1="240" y1="440" x2="300" y2="620" />
                    <line x1="90" y1="820" x2="260" y2="800" />
                    <line x1="260" y1="800" x2="420" y2="840" />
                    <line x1="300" y1="620" x2="260" y2="800" />
                </g>
            </svg>

            <div className="relative">
                <div
                    className="flex h-11 w-11 rotate-[-6deg] items-center justify-center bg-[#E8502B] text-lg font-semibold text-[#241129]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    M
                </div>
            </div>

            <div className="relative max-w-sm">
                <p
                    className="mb-4 text-sm text-[#C9A8CE]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    {etapa === 'login'
                        ? 'Painel administrativo'
                        : 'Verificação de dispositivo'}
                </p>

                <h1
                    className="text-[2.6rem] leading-[1.08] text-[#F3EEE9]"
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontOpticalSizing: 'auto',
                        fontWeight: 480,
                    }}
                >
                    {etapa === 'login'
                        ? 'Cada acesso, verificado.'
                        : 'Só entra quem confirma.'}
                </h1>

                <p
                    className="mt-5 text-[15px] leading-relaxed text-[#C9A8CE]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    {etapa === 'login'
                        ? 'Novos dispositivos passam por uma confirmação por e-mail antes de acessar o painel.'
                        : 'Um código de 6 dígitos foi enviado para o seu e-mail cadastrado. Ele expira em poucos minutos.'}
                </p>
            </div>

            <p
                className="relative text-xs text-[#8A6E92]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
                Conexão criptografada de ponta a ponta
            </p>
        </aside>
    )
}

function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')

    const [codigo, setCodigo] = useState('')
    const [tokenConfirmacao, setTokenConfirmacao] = useState('')

    const [confirmandoDispositivo, setConfirmandoDispositivo] =
        useState(false)

    const [erro, setErro] = useState('')
    const [carregando, setCarregando] = useState(false)

    const [tempoRestante, setTempoRestante] = useState(0)

    useEffect(() => {
        if (tempoRestante <= 0) {
            return
        }

        const timer = setInterval(() => {
            setTempoRestante((tempo) => tempo - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [tempoRestante])

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setErro('')

        if (tempoRestante > 0) {
            return
        }

        if (!email.trim()) {
            setErro('Informe o e-mail.')
            return
        }

        if (!senha) {
            setErro('Informe a senha.')
            return
        }

        setCarregando(true)

        try {
            const resultado = await login(
                email.trim(),
                senha
            )

            /*
             * O dispositivo ainda não foi confirmado.
             */
            if (resultado.confirmacaoNecessaria) {
                setTokenConfirmacao(
                    resultado.tokenConfirmacao ?? ''
                )

                setConfirmandoDispositivo(true)

                return
            }

            /*
             * Dispositivo já confiável.
             */
            navigate('/dashboard')
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === 'RATE_LIMIT'
            ) {
                setTempoRestante(60)

                setErro(
                    'Muitas tentativas. Aguarde antes de tentar novamente.'
                )
            } else if (error instanceof Error) {
                setErro(error.message)
            } else {
                setErro(
                    'Ocorreu um erro ao realizar o login.'
                )
            }
        } finally {
            setCarregando(false)
        }
    }

    async function handleConfirmarDispositivo(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setErro('')

        if (codigo.length !== 6) {
            setErro('Informe o código de 6 dígitos.')
            return
        }

        if (!tokenConfirmacao) {
            setErro(
                'A confirmação não é mais válida. Faça o login novamente.'
            )

            return
        }

        setCarregando(true)

        try {
            await confirmarDispositivo(
                tokenConfirmacao,
                codigo
            )

            navigate('/dashboard')
        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message)
            } else {
                setErro(
                    'Não foi possível confirmar o dispositivo.'
                )
            }
        } finally {
            setCarregando(false)
        }
    }

    const fonteUI = { fontFamily: "'Space Grotesk', sans-serif" }

    /*
     * Tela de confirmação
     */
    if (confirmandoDispositivo) {
        return (
            <main className="flex min-h-screen bg-[#FAF7F1]">
                <CarregarFontes />
                <PainelIdentidade etapa="confirmacao" />

                <div className="flex flex-1 items-center justify-center px-6 py-16">
                    <div className="w-full max-w-[360px]">
                        <p
                            className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[#B8551F] md:hidden"
                            style={fonteUI}
                        >
                            Verificação
                        </p>

                        <h2
                            className="mb-2 text-2xl text-[#1C1B1F]"
                            style={{ fontFamily: "'Fraunces', serif", fontWeight: 520 }}
                        >
                            Confirme seu dispositivo
                        </h2>

                        <p
                            className="mb-9 text-sm leading-relaxed text-[#8A8390]"
                            style={fonteUI}
                        >
                            Digite o código de 6 dígitos enviado ao seu e-mail.
                        </p>

                        <form
                            onSubmit={handleConfirmarDispositivo}
                            className="space-y-7"
                        >
                            <div>
                                <label
                                    htmlFor="codigo"
                                    className="mb-2 block text-[13px] font-medium text-[#1C1B1F]"
                                    style={fonteUI}
                                >
                                    Código de confirmação
                                </label>

                                <input
                                    id="codigo"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={codigo}
                                    onChange={(event) =>
                                        setCodigo(
                                            event.target.value.replace(
                                                /\D/g,
                                                ''
                                            )
                                        )
                                    }
                                    placeholder="000000"
                                    autoComplete="one-time-code"
                                    disabled={carregando}
                                    className="w-full border-0 border-b-2 border-[#E7E1D8] bg-transparent pb-3 text-2xl tracking-[0.55em] text-[#1C1B1F] outline-none transition-colors placeholder:text-[#D8D2C8] focus:border-[#E8502B] disabled:opacity-50"
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                />
                            </div>

                            {erro && (
                                <div
                                    role="alert"
                                    className="border-l-2 border-[#E8502B] pl-3 text-[13px] leading-snug text-[#B8551F]"
                                    style={fonteUI}
                                >
                                    {erro}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    carregando ||
                                    codigo.length !== 6
                                }
                                className="w-full bg-[#E8502B] px-4 py-3.5 text-sm font-medium text-[#FAF7F1] transition-colors hover:bg-[#C43F1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8502B] disabled:cursor-not-allowed disabled:bg-[#E7E1D8] disabled:text-[#B0AAA0]"
                                style={fonteUI}
                            >
                                {carregando
                                    ? 'Confirmando...'
                                    : 'Confirmar dispositivo'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        )
    }

    /*
     * Tela de login
     */
    return (
        <main className="flex min-h-screen bg-[#FAF7F1]">
            <CarregarFontes />
            <PainelIdentidade etapa="login" />

            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-[360px]">
                    <div
                        className="mb-8 flex h-10 w-10 rotate-[-6deg] items-center justify-center bg-[#241129] text-base font-semibold text-[#F3EEE9] md:hidden"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        M
                    </div>

                    <h1
                        className="mb-2 text-[1.7rem] text-[#1C1B1F]"
                        style={{ fontFamily: "'Fraunces', serif", fontWeight: 520 }}
                    >
                        Bem-vindo de volta
                    </h1>

                    <p
                        className="mb-9 text-sm text-[#8A8390]"
                        style={fonteUI}
                    >
                        Digite suas credenciais para acessar o painel.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Campo E-mail */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-[13px] font-medium text-[#1C1B1F]"
                                style={fonteUI}
                            >
                                E-mail
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="seu@email.com"
                                autoComplete="email"
                                disabled={
                                    carregando ||
                                    tempoRestante > 0
                                }
                                className="w-full border-0 border-b-2 border-[#E7E1D8] bg-transparent pb-2.5 text-[15px] text-[#1C1B1F] outline-none transition-colors placeholder:text-[#B0AAA0] focus:border-[#E8502B] disabled:opacity-50"
                                style={fonteUI}
                            />
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label
                                htmlFor="senha"
                                className="mb-2 block text-[13px] font-medium text-[#1C1B1F]"
                                style={fonteUI}
                            >
                                Senha
                            </label>

                            <input
                                id="senha"
                                type="password"
                                value={senha}
                                onChange={(event) =>
                                    setSenha(event.target.value)
                                }
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={
                                    carregando ||
                                    tempoRestante > 0
                                }
                                className="w-full border-0 border-b-2 border-[#E7E1D8] bg-transparent pb-2.5 text-[15px] text-[#1C1B1F] outline-none transition-colors placeholder:text-[#B0AAA0] focus:border-[#E8502B] disabled:opacity-50"
                                style={fonteUI}
                            />
                        </div>

                        {/* Mensagem de erro */}
                        {erro && (
                            <div
                                role="alert"
                                className="border-l-2 border-[#E8502B] pl-3 text-[13px] leading-snug text-[#B8551F]"
                                style={fonteUI}
                            >
                                {erro}
                            </div>
                        )}

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={
                                carregando ||
                                tempoRestante > 0
                            }
                            className="w-full bg-[#E8502B] px-4 py-3.5 text-sm font-medium text-[#FAF7F1] transition-colors hover:bg-[#C43F1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8502B] disabled:cursor-not-allowed disabled:bg-[#E7E1D8] disabled:text-[#B0AAA0]"
                            style={fonteUI}
                        >
                            {carregando
                                ? 'Entrando...'
                                : tempoRestante > 0
                                    ? `Aguarde ${tempoRestante}s para tentar`
                                    : 'Entrar no sistema'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}

export default Login