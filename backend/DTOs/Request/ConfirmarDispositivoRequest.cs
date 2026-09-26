using System.ComponentModel.DataAnnotations;

namespace app.DTOs.Requests;

public class ConfirmarDispositivoRequest
{
    [Required(ErrorMessage = "O token de confirmação é obrigatório.")]
    public string TokenConfirmacao { get; set; } = "";

    [Required(ErrorMessage = "O código é obrigatório.")]
    [StringLength(
        6,
        MinimumLength = 6,
        ErrorMessage = "O código deve possuir 6 dígitos."
    )]
    public string Codigo { get; set; } = "";
}