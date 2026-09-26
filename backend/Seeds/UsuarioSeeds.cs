using app.Data;
using app.Models;
using Microsoft.EntityFrameworkCore;

namespace app.Seeds;

public static class UsuarioSeed
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Usuarios.AnyAsync())
        {
            return;
        }

        var usuario = new Usuario
        {
            Nome = "Administrador",
            Email = "admin@example.com",
            Cpf = "00000000000",
            Nivel = "CEO",
            Ativo = true,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
        };

        db.Usuarios.Add(usuario);

        await db.SaveChangesAsync();
    }
}