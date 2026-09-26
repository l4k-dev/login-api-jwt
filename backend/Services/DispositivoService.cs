using System.Security.Cryptography;
using System.Text;

using app.Data;
using app.Models;

using Microsoft.EntityFrameworkCore;

namespace app.Services;

public class DispositivoService
{
    private readonly AppDbContext _db;

    public DispositivoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DispositivoConfiavel?> BuscarDispositivoAsync(
        int usuarioId,
        string token
    )
    {
        var tokenHash = GerarHash(token);

        return await _db.DispositivosConfiaveis
            .FirstOrDefaultAsync(d =>
                d.UsuarioId == usuarioId &&
                d.TokenHash == tokenHash &&
                d.Ativo &&
                d.DataExpiracao > DateTime.UtcNow
            );
    }

    public async Task RegistrarAcessoAsync(
        DispositivoConfiavel dispositivo
    )
    {
        dispositivo.DataUltimoAcesso = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task<DispositivoCriado> CriarAsync(
        int usuarioId,
        string nomeDispositivo
    )
    {
        var token = GerarToken();

        var dispositivo = new DispositivoConfiavel
        {
            UsuarioId = usuarioId,
            TokenHash = GerarHash(token),
            NomeDispositivo = nomeDispositivo,
            DataCriacao = DateTime.UtcNow,
            DataUltimoAcesso = DateTime.UtcNow,
            DataExpiracao = DateTime.UtcNow.AddDays(30),
            Ativo = true
        };

        _db.DispositivosConfiaveis.Add(dispositivo);

        await _db.SaveChangesAsync();

        return new DispositivoCriado
        {
            Dispositivo = dispositivo,
            Token = token
        };
    }

    public async Task RevogarAsync(
        DispositivoConfiavel dispositivo
    )
    {
        dispositivo.Ativo = false;

        await _db.SaveChangesAsync();
    }

    public async Task<ConfirmacaoCriada> CriarConfirmacaoAsync(
     int usuarioId
    )
    {
        var codigo = GerarCodigoConfirmacao();
        var tokenConfirmacao = GerarToken();

        var confirmacoesAnteriores = await _db.ConfirmacoesDispositivos
            .Where(c =>
                c.UsuarioId == usuarioId &&
                !c.Utilizado
            )
            .ToListAsync();

        foreach (var confirmacao in confirmacoesAnteriores)
        {
            confirmacao.Utilizado = true;
        }

        var confirmacaoNova = new ConfirmacaoDispositivo
        {
            UsuarioId = usuarioId,
            CodigoHash = GerarHash(codigo),
            TokenConfirmacao = GerarHash(tokenConfirmacao),
            DataCriacao = DateTime.UtcNow,
            DataExpiracao = DateTime.UtcNow.AddMinutes(10),
            Tentativas = 0,
            Utilizado = false
        };

        _db.ConfirmacoesDispositivos.Add(confirmacaoNova);

        await _db.SaveChangesAsync();

        return new ConfirmacaoCriada
        {
            TokenConfirmacao = tokenConfirmacao,
            Codigo = codigo
        };
    }

    public async Task<ConfirmacaoDispositivo?> ValidarConfirmacaoAsync(
     string tokenConfirmacao,
     string codigo
 )
    {
        var tokenHash = GerarHash(tokenConfirmacao);

        var confirmacao = await _db.ConfirmacoesDispositivos
            .FirstOrDefaultAsync(c =>
                c.TokenConfirmacao == tokenHash &&
                !c.Utilizado &&
                c.DataExpiracao > DateTime.UtcNow
            );

        if (confirmacao == null)
        {
            return null;
        }

        if (confirmacao.Tentativas >= 5)
        {
            return null;
        }

        confirmacao.Tentativas++;

        var codigoHash = GerarHash(codigo);

        var valido = codigoHash == confirmacao.CodigoHash;

        if (!valido)
        {
            await _db.SaveChangesAsync();

            return null;
        }

        confirmacao.Utilizado = true;

        await _db.SaveChangesAsync();

        return confirmacao;
    }

    private static string GerarCodigoConfirmacao()
    {
        var codigo = RandomNumberGenerator.GetInt32(
            100000,
            1000000
        );

        return codigo.ToString();
    }

    private static string GerarToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);

        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    private static string GerarHash(string valor)
    {
        var bytes = SHA256.HashData(
            Encoding.UTF8.GetBytes(valor)
        );

        return Convert.ToHexString(bytes);
    }
}

public class DispositivoCriado
{
    public DispositivoConfiavel Dispositivo { get; set; } = null!;

    public string Token { get; set; } = "";
}
public class ConfirmacaoCriada
{
    public string TokenConfirmacao { get; set; } = "";

    public string Codigo { get; set; } = "";
}