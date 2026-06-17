using Microsoft.AspNetCore.Http;

namespace ITConnect.Data.ResponsesModel.TraineeResponseModels
{
    public class TraineeProfileRequestAndResponse
    {
        public string Name { get; set; }
        public string? Phone { get; set; }

        public string? PortfolioLink { get; set; }
        public string? Skills { get; set; }

        public string? ResumeUrl { get; set; }
        public string? ImageUrl { get; set; }

        public long? GithubInstallationId { get; set; }
        public string? GithubUsername { get; set; }
        
        public IFormFile? ResumeFile { get; set; }
    }
}
