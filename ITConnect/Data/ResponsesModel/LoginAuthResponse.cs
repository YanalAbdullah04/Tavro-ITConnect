namespace ITConnect.Data.ResponsesModel
{
    public class LoginAuthResponse
    {
        public bool IsSuccess { get; set; }
        public string Token { get; set; }
        public DateTime? Expiration { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
