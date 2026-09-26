using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace app.Models;

public class DispositivoConfiavel
{
    public int Id { get; set; }

    [Required]
    public int UsuarioId { get; set; }

    [Required]
    public string TokenHash { get; set; } = "";

    public string NomeDispositivo { get; set; } = "";

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public DateTime DataUltimoAcesso { get; set; } = DateTime.UtcNow;

    public DateTime DataExpiracao { get; set; }

    public bool Ativo { get; set; } = true;

    [ForeignKey(nameof(UsuarioId))]
    public Usuario Usuario { get; set; } = null!;
}