using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace app.Models;

public class ConfirmacaoDispositivo
{
    public int Id { get; set; }

    [Required]
    public int UsuarioId { get; set; }
    [Required]
    public string TokenConfirmacao { get; set; } = "";

    [Required]
    public string CodigoHash { get; set; } = "";

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public DateTime DataExpiracao { get; set; }

    public int Tentativas { get; set; } = 0;

    public bool Utilizado { get; set; } = false;

    [ForeignKey(nameof(UsuarioId))]
    public Usuario Usuario { get; set; } = null!;
}