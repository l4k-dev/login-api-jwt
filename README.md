# API Login — ASP.NET Core + React

Projeto full stack desenvolvido para demonstrar uma arquitetura de autenticação utilizando **ASP.NET Core Web API**, **React.js**, **PostgreSQL** e **JWT**, com autenticação baseada em cookies, confirmação de novos dispositivos por e-mail e controle de tentativas de login.

## Tecnologias

### Backend

* C#
* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* JWT
* BCrypt
* MailKit
* Swagger / OpenAPI
* Rate Limiting

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS

### Infraestrutura

* Docker
* Docker Compose
* PostgreSQL

---

## Funcionalidades

* Cadastro e autenticação de usuários
* Login com e-mail e senha
* Senhas armazenadas utilizando BCrypt
* Autenticação utilizando JWT
* JWT armazenado em cookie `HttpOnly`
* Validação de `Issuer`, `Audience`, assinatura e expiração do JWT
* Confirmação de novos dispositivos por código enviado por e-mail
* Dispositivos confiáveis por até 30 dias
* Hash dos tokens de dispositivos no banco
* Expiração dos códigos de confirmação
* Limite de tentativas para códigos de confirmação
* Rate limiting no endpoint de login
* Logout
* Endpoint para recuperar os dados do usuário autenticado
* PostgreSQL com Entity Framework Core
* Migrations automáticas na inicialização
* Swagger para documentação e testes da API

🏗️ Arquitetura

A aplicação é dividida em duas partes principais:

api-login/
│
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Models/
│   ├── Seeds/
│   └── Services/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── docker-compose.yml
├── .env.example
└── README.md

O fluxo principal da aplicação segue:

React
  │
  │ HTTP
  ▼
ASP.NET Core Web API
  │
  ├── AuthService
  ├── DispositivoService
  └── EmailService
  │
  ▼
Entity Framework Core
  │
  ▼
PostgreSQL
-> ## Fluxo de autenticação

O login utiliza dois níveis de autenticação:

JWT para autenticação da sessão.
Cookie de dispositivo confiável para reconhecer dispositivos já confirmados.
Primeiro acesso
Usuário
   │
   │ E-mail + senha
   ▼
POST /api/auth/login
   │
   ├── Valida usuário
   ├── Verifica senha com BCrypt
   └── Verifica dispositivo confiável
             │
             ▼
       Dispositivo novo
             │
             ▼
      Gera código de 6 dígitos
             │
             ▼
       Envia código por e-mail
             │
             ▼
   Frontend solicita confirmação

O código possui validade de 10 minutos e pode ser utilizado no máximo cinco vezes.

Após a confirmação:

Código correto
      │
      ▼
Dispositivo confiável criado
      │
      ├── Token armazenado como hash no banco
      └── Token original enviado em cookie HttpOnly
      │
      ▼
JWT gerado
      │
      ▼
Usuário autenticado
-> Dispositivo confiável <-

Após a confirmação de um novo dispositivo, a API cria um token aleatório utilizando RandomNumberGenerator.

O banco não armazena o token original.

O fluxo é:

Token original
     │
     ▼
SHA-256
     │
     ▼
Banco de dados

Enquanto isso, o token original fica armazenado no navegador através de um cookie HttpOnly.

O dispositivo confiável possui validade de 30 dias.

Em um novo login, a API compara o hash do token recebido com o hash armazenado no banco.

Se o dispositivo ainda estiver ativo e dentro do prazo de validade, a confirmação por e-mail não é necessária.

#### Cookies e JWT

O JWT não é armazenado no localStorage ou sessionStorage.

A API envia o token através de um cookie:

access_token

O cookie é configurado como:

HttpOnly
Secure em produção
SameSite=Lax
validade de 2 horas

O backend recupera automaticamente o JWT através do cookie e utiliza o middleware de autenticação do ASP.NET Core.

O cookie de dispositivo confiável utiliza as mesmas proteções e possui validade de 30 dias.

-> Rate Limiting

O endpoint de login possui um limite de requisições:

5 tentativas
por
1 minuto

Quando o limite é atingido, a API retorna:

429 Too Many Requests

Essa proteção reduz tentativas excessivas de autenticação.

## Banco de dados

O projeto utiliza:

PostgreSQL + Entity Framework Core

As principais entidades relacionadas à autenticação são:

Usuario
   │
   ├── DispositivoConfiavel
   │
   └── ConfirmacaoDispositivo

As migrations do Entity Framework Core são aplicadas automaticamente durante a inicialização da API.

## Configuração de e-mail

A confirmação de novos dispositivos utiliza SMTP através do MailKit.

As configurações são fornecidas através de variáveis de ambiente:

EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_HOST=
EMAIL_PORT=

O projeto não possui credenciais SMTP diretamente no código.

-> Configuração <-

Crie um arquivo .env baseado no .env.example:

DATABASE_NAME=teste_react
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

DATABASE_CONNECTION=Host=postgres;Port=5432;Database=teste_react;Username=postgres;Password=postgres

JWT_KEY=CHANGE_ME_GENERATE_A_SECURE_KEY
JWT_ISSUER=TesteReact
JWT_AUDIENCE=TesteReact

EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=CHANGE_ME
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587

Nunca utilize credenciais reais no .env.example ou diretamente no código-fonte.

O arquivo .env deve permanecer fora do Git.

-> Executando com Docker
1. Clone o repositório
git clone https://github.com/l4k-dev/login-api-jwt
cd login-api-jwt
2. Configure o ambiente

Crie o arquivo:

.env

utilizando .env.example como referência.

Configure a chave JWT e, caso queira testar o envio de e-mails, configure também os dados do servidor SMTP.

3. Inicie os containers
docker compose up --build

O Docker iniciará:

React
ASP.NET Core
PostgreSQL
###Portas###
Serviço	Porta
React / Vite	5178
ASP.NET Core API	5000
PostgreSQL	5432

Frontend:

http://localhost:5178

API:

http://localhost:5000

Swagger:

http://localhost:5000/swagger
### -> Swagger

Durante o ambiente de desenvolvimento, a API disponibiliza a documentação Swagger.

Acesse:

http://localhost:5000/swagger

Através do Swagger é possível visualizar e testar os endpoints disponibilizados pela API.

## Inicialização do banco

Ao iniciar a API, o Entity Framework Core verifica e aplica as migrations pendentes:

await db.Database.MigrateAsync();

Depois disso, o sistema executa o seed inicial:

await UsuarioSeed.SeedAsync(db);

O seed verifica se já existem usuários antes de criar o usuário inicial.

Para um ambiente público, os dados utilizados pelo seed devem ser fictícios ou fornecidos através de variáveis de ambiente.

## Principais endpoints
Autenticação
Método	Endpoint	Descrição
POST	/api/auth/login	Realiza login
POST	/api/auth/confirmar-dispositivo	Confirma um novo dispositivo
POST	/api/auth/logout	Encerra a sessão
GET	/api/auth/me	Retorna o usuário autenticado
Login
POST /api/auth/login
Content-Type: application/json

Exemplo:

{
  "email": "usuario@example.com",
  "senha": "sua-senha"
}

Quando o dispositivo já é confiável, a API autentica diretamente.

Quando o dispositivo é novo, a resposta informa que a confirmação é necessária e o código é enviado por e-mail.

## Segurança

O projeto utiliza algumas práticas de segurança:

Senhas armazenadas com BCrypt
JWT assinado com HMAC-SHA256
Chave JWT fornecida por variável de ambiente
JWT armazenado em cookie HttpOnly
Cookies com Secure em produção
Validação de issuer e audience
Validação de expiração do JWT
Tokens de dispositivos armazenados apenas como hash
Códigos de confirmação armazenados como hash
Códigos de confirmação com expiração
Limite de tentativas para confirmação
Rate limiting no login
Segredos fora do código-fonte
-> Objetivo do projeto

Este projeto foi desenvolvido como estudo prático de autenticação e construção de uma aplicação full stack utilizando tecnologias utilizadas no desenvolvimento web moderno.

O foco principal está na integração entre:

React
   +
ASP.NET Core Web API
   +
PostgreSQL
   +
JWT
   +
Docker

Além da implementação de autenticação baseada em cookies, o projeto demonstra um fluxo de confirmação de novos dispositivos através de e-mail.

# Autor

Desenvolvido como projeto prático de estudo e portfólio em desenvolvimento Full Stack.

# Licença

Este projeto pode ser utilizado para fins de estudo e referência.
