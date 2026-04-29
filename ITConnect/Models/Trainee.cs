using ITConnect.Data;
using Microsoft.AspNetCore.Identity;

namespace ITConnect.Models
{

    public class Trainee :BaseEntity
    {
 
        public IdentityUser User { get; set; }

        public string? CompanyId { get; set; }       // FK → Company.UserId
        public Company? Company { get; set; }
        public string? TrainingSessionId { get; set; }
        public TrainingSession?TrainingSession { get; set; }
        public string Name { get; set; }

        public string? PortfolioLink { get; set; }
        public string? Skills { get; set; }

        public string? ResumeUrl { get; set; }
        public string? ImageUrl { get; set; }
    }

}
