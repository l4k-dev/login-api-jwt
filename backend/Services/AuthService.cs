using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using app.Data;
using app.DTOs.Requests;
using app.DTOs.Responses;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace app.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly DispositivoService _dispositivoService;
    private readonly EmailService _emailService;

    public AuthService(
        AppDbContext db,
        IConfiguration configuration,
        DispositivoService dispositivoService,
        EmailService emailService)
    {
        _db = db;
        _configuration = configuration;
        _dispositivoService = dispositivoService;
        _emailService = emailService;
    }

    public async Task<LoginResultado?> LoginAsync(
        LoginRequest request,
        string? tokenDispositivo)
    {
        var usuario = await _db.Usuarios
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (usuario == null)
        {
            return null;
        }

        var senhaValida = BCrypt.Net.BCrypt.Verify(
            request.Senha,
            usuario.SenhaHash
        );

        if (!senhaValida)
        {
            return null;
        }

        if (!usuario.Ativo)
        {
            return null;
        }

        // Verifica se o dispositivo atual já é confiável
        if (!string.IsNullOrWhiteSpace(tokenDispositivo))
        {
            var dispositivo = await _dispositivoService.BuscarDispositivoAsync(
                usuario.Id,
                tokenDispositivo
            );

            if (dispositivo != null)
            {
                await _dispositivoService.RegistrarAcessoAsync(
                    dispositivo
                );

                var token = GerarToken(usuario);

                return new LoginResultado
                {
                    ConfirmacaoNecessaria = false,
                    Token = token,
                    Response = CriarRespostaUsuario(usuario)
                };
            }
        }

        // Dispositivo ainda não confiável.
        // Cria uma confirmação temporária.
        var confirmacao = await _dispositivoService.CriarConfirmacaoAsync(
            usuario.Id
        );

        // Envia o código de confirmação por e-mail.
        await _emailService.EnviarAsync(
            usuario.Email,
            "Confirmação de novo dispositivo",
            $"""
            <h2>Confirmação de dispositivo</h2>

            <p>Olá, {usuario.Nome}.</p>

            <p>
                Recebemos uma tentativa de login em um novo dispositivo.
            </p>

            <p>
                Seu código de confirmação é:
            </p>

            <h1>{confirmacao.Codigo}</h1>

            <p>
                Este código é válido por 10 minutos.
            </p>

            <p>
                Se você não reconhece esta tentativa de acesso,
                recomendamos alterar sua senha.
            </p>
            """
        );

        return new LoginResultado
        {
            ConfirmacaoNecessaria = true,
            Token = null,
            TokenConfirmacao = confirmacao.TokenConfirmacao,
            Response = new LoginResponse
            {
                Mensagem = "É necessária a confirmação deste dispositivo.",

                Usuario = new UsuarioResponse
                {
                    Id = usuario.Id,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                    Nivel = usuario.Nivel
                }
            }
        };
    }
    public async Task<ConfirmacaoLoginResultado?> ConfirmarDispositivoAsync(
        string tokenConfirmacao,
        string codigo
    )
    {
        var confirmacao = await _dispositivoService.ValidarConfirmacaoAsync(
            tokenConfirmacao,
            codigo
        );

        if (confirmacao == null)
        {
            return null;
        }

        var usuario = await _db.Usuarios
            .FirstOrDefaultAsync(u =>
                u.Id == confirmacao.UsuarioId &&
                u.Ativo
            );

        if (usuario == null)
        {
            return null;
        }

        var dispositivoCriado = await _dispositivoService.CriarAsync(
            usuario.Id,
            "Dispositivo"
        );

        var token = GerarToken(usuario);

        return new ConfirmacaoLoginResultado
        {
            Token = token,
            TokenDispositivo = dispositivoCriado.Token,
            Response = CriarRespostaUsuario(usuario)
        };
    }
    private LoginResponse CriarRespostaUsuario(
        Models.Usuario usuario)
    {
        return new LoginResponse
        {
            Mensagem = "Login realizado com sucesso.",

            Usuario = new UsuarioResponse
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Nivel = usuario.Nivel
            }
        };
    }

    private string GerarToken(
        Models.Usuario usuario)
    {
        var claims = new[]
        {
            new Claim(
                JwtRegisteredClaimNames.Sub,
                usuario.Id.ToString()
            ),

            new Claim(
                JwtRegisteredClaimNames.Email,
                usuario.Email
            ),

            new Claim(
                ClaimTypes.NameIdentifier,
                usuario.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                usuario.Nome
            ),

            new Claim(
                ClaimTypes.Role,
                usuario.Nivel
            ),

            new Claim(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()
            )
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"]!
            )
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}

public class LoginResultado
{
    public bool ConfirmacaoNecessaria { get; set; }

    public string? Token { get; set; }

    public string? TokenConfirmacao { get; set; }

    public LoginResponse Response { get; set; } = new();
}
public class ConfirmacaoLoginResultado
{
    public string Token { get; set; } = "";

    public string TokenDispositivo { get; set; } = "";

    public LoginResponse Response { get; set; } = new();
}