using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace app.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task EnviarAsync(
        string destinatario,
        string assunto,
        string mensagem
    )
    {
        var emailRemetente = _configuration["Email:Username"];
        var senha = _configuration["Email:Password"];
        var host = _configuration["Email:Host"];
        var portaTexto = _configuration["Email:Port"];

        if (string.IsNullOrWhiteSpace(emailRemetente))
        {
            throw new InvalidOperationException(
                "O e-mail do remetente não foi configurado."
            );
        }

        if (string.IsNullOrWhiteSpace(senha))
        {
            throw new InvalidOperationException(
                "A senha SMTP não foi configurada."
            );
        }

        if (string.IsNullOrWhiteSpace(host))
        {
            throw new InvalidOperationException(
                "O servidor SMTP não foi configurado."
            );
        }

        if (!int.TryParse(portaTexto, out var porta))
        {
            throw new InvalidOperationException(
                "A porta SMTP não foi configurada corretamente."
            );
        }

        var email = new MimeMessage();

        email.From.Add(
            new MailboxAddress(
                "Sistema",
                emailRemetente
            )
        );

        email.To.Add(
            MailboxAddress.Parse(destinatario)
        );

        email.Subject = assunto;

        email.Body = new TextPart("html")
        {
            Text = mensagem
        };

        using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            host,
            porta,
            SecureSocketOptions.StartTls
        );

        await smtp.AuthenticateAsync(
            emailRemetente,
            senha
        );

        await smtp.SendAsync(email);

        await smtp.DisconnectAsync(true);
    }
}