namespace ITConnect.Data.ResponsesModel
{
    public class RegistrationAuthResponse
    {
        public bool IsSuccess { get; set; }
        public string Token { get; set; } 
        public DateTime? Expiration { get; set; }
        public string UserRole { get; set; }  
        public List<string> Errors { get; set; } = new List<string>();
    }
}
