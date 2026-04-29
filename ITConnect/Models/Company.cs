namespace ITConnect.Models
{
    using ITConnect.Data;
    using Microsoft.AspNetCore.Identity;

    // 2. Company
    public class Company :BaseEntity

    {
       // PK + FK to AspNetUsers
        public IdentityUser User { get; set; }
        public string Name { get; set; }
        public string? Address { get; set; }
        public string? WebsiteLink { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }



    }

}
