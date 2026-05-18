using System.ComponentModel.DataAnnotations;

namespace ITConnect.Data.RequestsModel.TrainerDto
{
    public class AssignTaskRequest
    {
        public string TaskTitle { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public string? Notes { get; set; }

        public DateTime Deadline { get; set; }
 
        public IFormFile? Attachment { get; set; }

        public List<string>? TraineesId { get; set; }
        public bool IncludeAll { get; set; }
    }
}
