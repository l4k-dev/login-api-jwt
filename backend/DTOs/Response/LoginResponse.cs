namespace app.DTOs.Responses;

public class LoginResponse
{
    public string Mensagem { get; set; } = "";

    public UsuarioResponse Usuario { get; set; } = new();
}

public class UsuarioResponse
{
    public int Id { get; set; }

    public string Nome { get; set; } = "";

    public string Email { get; set; } = "";

    public string Nivel { get; set; } = "";
}