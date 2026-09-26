using System.ComponentModel.DataAnnotations;

namespace app.DTOs.Requests;

public class LoginRequest
{
    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "A senha é obrigatória.")]
    public string Senha { get; set; } = "";
}