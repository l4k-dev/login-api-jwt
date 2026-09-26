# API Login — ASP.NET Core + React

Sistema de autenticação full stack com **ASP.NET Core Web API**, **React.js**, 
**PostgreSQL** e **JWT**, com autenticação baseada em cookies HttpOnly, 
reconhecimento de dispositivo confiável e confirmação de novos acessos por e-mail.

![.NET](https://img.shields.io/badge/.NET-512BD4?style=flat&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat&logo=jsonwebtokens)

---

## Sobre o projeto

Projeto desenvolvido como estudo prático de autenticação e construção de uma 
aplicação full stack, integrando **React + ASP.NET Core Web API + PostgreSQL + 
JWT + Docker**, com foco especial em segurança: JWT em cookie HttpOnly, hash de 
tokens de dispositivo, rate limiting e confirmação de acesso por e-mail.

## Funcionalidades

- Cadastro e autenticação de usuários (e-mail e senha)
- Senhas armazenadas com BCrypt
- Autenticação via JWT, armazenado em cookie `HttpOnly` (nunca em localStorage/sessionStorage)
- Validação de `Issuer`, `Audience`, assinatura e expiração do JWT
- Reconhecimento de dispositivo confiável (válido por 30 dias) com token em hash SHA-256 no banco
- Confirmação de novos dispositivos via código de 6 dígitos por e-mail (validade de 10 min, máx. 5 tentativas)
- Rate limiting no login (5 tentativas por minuto → `429 Too Many Requests`)
- Logout e endpoint para dados do usuário autenticado
- Migrations automáticas e seed inicial na inicialização
- Documentação interativa via Swagger

## Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | C#, ASP.NET Core Web API, Entity Framework Core, PostgreSQL, JWT, BCrypt, MailKit, Swagger/OpenAPI, Rate Limiting |
| **Frontend** | React.js, Vite, JavaScript, HTML5, CSS |
| **Infraestrutura** | Docker, Docker Compose, PostgreSQL |

## Arquitetura

```
api-login/
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Models/
│   ├── Seeds/
│   └── Services/
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
├── docker-compose.yml
├── .env.example
└── README.md
```

Fluxo principal:

```
React → ASP.NET Core Web API → (AuthService, DispositivoService, EmailService) → Entity Framework Core → PostgreSQL
```

## Fluxo de autenticação

O login combina dois níveis: **JWT** para a sessão e um **cookie de dispositivo 
confiável** para reconhecer acessos já validados.

1. Usuário envia e-mail + senha em `POST /api/auth/login`
2. A API valida a senha (BCrypt) e verifica se o dispositivo já é confiável
3. **Dispositivo novo** → gera código de 6 dígitos e envia por e-mail
4. Usuário confirma o código → dispositivo confiável é criado (token em hash SHA-256 no banco, original em cookie HttpOnly) e o JWT é emitido
5. **Dispositivo já confiável** → login direto, sem nova confirmação por e-mail

### Cookies e JWT

- JWT enviado via cookie `access_token` (HttpOnly, `Secure` em produção, `SameSite=Lax`, validade de 2h)
- Cookie de dispositivo confiável com as mesmas proteções, validade de 30 dias
- O backend recupera o JWT automaticamente do cookie via middleware de autenticação do ASP.NET Core

## Banco de dados

PostgreSQL + Entity Framework Core, com as entidades principais:

```
Usuario
 ├── DispositivoConfiavel
 └── ConfirmacaoDispositivo
```

Migrations aplicadas automaticamente na inicialização da API.

## Principais endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Realiza login |
| POST | `/api/auth/confirmar-dispositivo` | Confirma um novo dispositivo |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/auth/me` | Retorna o usuário autenticado |

Exemplo de login:

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "senha": "sua-senha"
}
```

## Usuário padrão (seed)

Ao iniciar pela primeira vez, a API cria automaticamente um usuário administrador 
via seed, caso ainda não exista nenhum usuário no banco:

| Campo | Valor |
|---|---|
| E-mail | `admin@example.com` |
| Senha | `Admin@123` |
| Nível | `CEO` |

> ⚠️ Essas são credenciais fictícias apenas para fins de teste/demonstração local. 
> **Nunca utilize este seed com dados reais em um ambiente de produção** — troque 
> a senha imediatamente ou substitua o seed por dados fornecidos via variável de 
> ambiente.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`:

```env
DATABASE_NAME=teste_react
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

DATABASE_CONNECTION=Host=postgres;Port=5432;Database=teste_react;Username=postgres;Password=postgres

JWT_KEY=your-super-secret-jwt-key-change-me
JWT_ISSUER=TesteReact
JWT_AUDIENCE=TesteReact

EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
```

| Variável | Descrição |
|---|---|
| `DATABASE_NAME` / `DATABASE_USER` / `DATABASE_PASSWORD` | Credenciais do PostgreSQL |
| `DATABASE_CONNECTION` | Connection string completa usada pelo Entity Framework Core |
| `JWT_KEY` | Chave secreta usada para assinar o JWT (HMAC-SHA256) — **gere uma chave forte e única** |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Valores de emissor e audiência validados no token |
| `EMAIL_USERNAME` / `EMAIL_PASSWORD` / `EMAIL_HOST` / `EMAIL_PORT` | Credenciais SMTP usadas pelo MailKit para envio dos códigos de confirmação de dispositivo |

> ⚠️ Nunca utilize credenciais reais no `.env.example` ou diretamente no código-fonte. 
> O arquivo `.env` deve permanecer fora do Git (já incluído no `.gitignore`).

## Segurança

- Senhas com BCrypt
- JWT assinado com HMAC-SHA256, chave via variável de ambiente
- JWT em cookie HttpOnly (nunca em storage do navegador)
- Validação de issuer, audience e expiração do JWT
- Tokens de dispositivo e códigos de confirmação armazenados apenas como hash
- Códigos de confirmação com expiração e limite de tentativas
- Rate limiting no login
- Segredos fora do código-fonte

## Como rodar (Docker)

```bash
git clone https://github.com/l4k-dev/login-api-jwt
cd login-api-jwt
cp .env.example .env
docker compose up --build
```

Configure `JWT_KEY` no `.env` (e os dados SMTP, se quiser testar o envio de e-mails).

| Serviço | Porta | URL |
|---|---|---|
| Frontend (React/Vite) | 5178 | http://localhost:5178 |
| API (ASP.NET Core) | 5000 | http://localhost:5000 |
| Swagger | 5000 | http://localhost:5000/swagger |

## Autor

Desenvolvido por [l4k-dev](https://github.com/l4k-dev) como projeto prático de 
estudo e portfólio em desenvolvimento Full Stack.

## Licença

Este projeto pode ser utilizado para fins de estudo e referência.
