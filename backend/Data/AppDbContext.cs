using app.Models;
using Microsoft.EntityFrameworkCore;

namespace app.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; }

    public DbSet<DispositivoConfiavel> DispositivosConfiaveis { get; set; }

    public DbSet<ConfirmacaoDispositivo> ConfirmacoesDispositivos { get; set; }
}