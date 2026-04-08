namespace ITConnect.Models
{

    using Microsoft.AspNetCore.Identity;

    public class Trainer :BaseEntity
    {

        public string UserId { get; set; }          // PK + FK → AspNetUsers.Id
        public IdentityUser User { get; set; }

        public string CompanyId { get; set; }
        public Company Company { get; set; }
        public string Name { get; set; }
        public string Specialization { get; set; }
        public string GithubUsername { get; set; }
        public string ImgUrl { get; set; }
    }

}
