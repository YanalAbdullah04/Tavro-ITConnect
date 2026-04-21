using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace ITConnect.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;

        public EmailService(IConfiguration configuration)
        {
            _smtpServer = configuration["SmtpSettings:SmtpServer"] ?? "";
            _smtpPort = int.Parse(configuration["SmtpSettings:SmtpPort"] ?? "587");
            _smtpUsername = configuration["SmtpSettings:SmtpUsername"] ?? "";
            _smtpPassword = configuration["SmtpSettings:SmtpPassword"] ?? "";
        }

        // Changed to async Task
        public async Task SendEmailAsync(string senderName, string senderEmail, string toName, string toEmail, string subject, string textContent)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder();

            builder.HtmlBody = $@"
<div style=""background-color: #ffffff; padding: 40px 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"">
    <div style=""max-width: 550px; margin: auto; background-color: #1e293b; padding: 50px 40px; border-radius: 12px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"">
        
        <h2 style=""color: #ffffff; font-size: 26px; margin-bottom: 20px; font-weight: 700;"">
            Welcome to <span style=""color: #3b82f6;"">ITConnect</span>
        </h2>
        
        <p style=""color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 35px;"">
            Hello, <strong>{toName}</strong>! Your account is ready. Click below to complete your profile and join the training intelligence platform.
        </p>
        
        <div style=""margin-bottom: 40px;"">
            <a href=""{textContent}"" style=""background-color: #3b82f6; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;"">
                Complete Profile Setup
            </a>
        </div>

        <div style=""border-top: 1px solid #334155; margin-bottom: 20px;""></div>
        
        <p style=""font-size: 12px; color: #64748b; margin: 0;"">
            © 2026 ITConnect 2.0. Training Intelligence Platform.
        </p>
    </div>
</div>";
            message.Body = builder.ToMessageBody();
            using (var client = new SmtpClient())
            {
                try
                {
                    // Added await and Async suffix
                    await client.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.Auto);

                    await client.AuthenticateAsync(_smtpUsername, _smtpPassword);

                    var result = await client.SendAsync(message);
                    Console.WriteLine("Email Sender OK: \n" + result);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Email Sender Failure: \n" + ex.Message);
                }
                finally
                {
                    // Disconnect is also async
                    await client.DisconnectAsync(true);
                }
            }
        }
    }
}