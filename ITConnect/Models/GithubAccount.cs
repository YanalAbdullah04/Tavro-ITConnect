namespace ITConnect.Models
{
    using System;

 
        // 5. Github Account
        public class GithubAccount :BaseEntity
        {
            public string UserId { get; set; }
            public string GithubUserId { get; set; }
            public string GithubUsername { get; set; }
            public string IsRole { get; set; }
            public string AccessTokenEnc { get; set; }
            public string Scope { get; set; }
            public DateTime ConnectedAt { get; set; }
            public DateTime LastUsedAt { get; set; }
        }
    
}
