using System.ComponentModel.DataAnnotations;

namespace app.Models;

public class Usuario
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = "";

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "O e-mail informado é inválido.")]
    public string Email { get; set; } = "";

    [Required]
    public string SenhaHash { get; set; } = "";

    [Required(ErrorMessage = "O CPF é obrigatório.")]
    public string Cpf { get; set; } = "";

    [Required(ErrorMessage = "O nível é obrigatório.")]
    public string Nivel { get; set; } = "";

    public bool Ativo { get; set; } = true;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public ICollection<DispositivoConfiavel> DispositivosConfiaveis { get; set; }
        = new List<DispositivoConfiavel>();

    public ICollection<ConfirmacaoDispositivo> ConfirmacoesDispositivo { get; set; }
        = new List<ConfirmacaoDispositivo>();
}