
using app.DTOs.Requests;
using app.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace app.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        AuthService authService,
        IWebHostEnvironment environment)
    {
        _authService = authService;
        _environment = environment;
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var tokenDispositivo = Request.Cookies["trusted_device"];

        var resultado = await _authService.LoginAsync(
            request,
            tokenDispositivo
        );

        if (resultado == null)
        {
            return Unauthorized(new
            {
                mensagem = "E-mail ou senha inválidos."
            });
        }

        // O dispositivo ainda não foi confirmado.
        // Portanto, não criamos o access_token.
        if (resultado.ConfirmacaoNecessaria)
        {
            return Ok(new
            {
                confirmacaoNecessaria = true,
                mensagem = resultado.Response.Mensagem,
                usuario = resultado.Response.Usuario,
                tokenConfirmacao = resultado.TokenConfirmacao
            });
        }

        // Login autorizado.
        // Agora podemos criar o cookie de autenticação.
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,

            // Desenvolvimento = HTTP
            // Produção = HTTPS
            Secure = !_environment.IsDevelopment(),

            SameSite = SameSiteMode.Lax,

            Expires = DateTimeOffset.UtcNow.AddHours(2),

            Path = "/"
        };

        Response.Cookies.Append(
            "access_token",
            resultado.Token!,
            cookieOptions
        );

        return Ok(resultado.Response);
    }
    [HttpPost("confirmar-dispositivo")]
    public async Task<IActionResult> ConfirmarDispositivo(
        ConfirmarDispositivoRequest request)
    {
        var resultado = await _authService.ConfirmarDispositivoAsync(
            request.TokenConfirmacao,
            request.Codigo
        );

        if (resultado == null)
        {
            return Unauthorized(new
            {
                mensagem = "Código de confirmação inválido ou expirado."
            });
        }

        var accessTokenCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(2),
            Path = "/"
        };

        Response.Cookies.Append(
            "access_token",
            resultado.Token,
            accessTokenCookieOptions
        );

        var trustedDeviceCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            Path = "/"
        };

        Response.Cookies.Append(
            "trusted_device",
            resultado.TokenDispositivo,
            trustedDeviceCookieOptions
        );

        return Ok(resultado.Response);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token");

        return Ok(new
        {
            mensagem = "Logout realizado com sucesso."
        });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            id = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value,

            nome = User.Identity?.Name,

            email = User.FindFirst(
                System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email
            )?.Value,

            nivel = User.FindFirst(
                System.Security.Claims.ClaimTypes.Role
            )?.Value
        });
    }
}
