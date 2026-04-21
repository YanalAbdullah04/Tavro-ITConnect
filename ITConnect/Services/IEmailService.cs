namespace ITConnect.Services
{
    public interface IEmailService
    {

        Task SendEmailAsync(string senderName, string senderEmail, string toName, string toEmail, string subject, string textContent);

    }
}
