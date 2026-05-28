
using ITConnect.Models;

namespace ITConnect.Data.RequestsModel.PostDTOs
{
    public class UpdatePostRequest
    {
        public string Id { get; set; }
        public PostStatus? Status { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public string ReqSkills { get; set; }
        public string Responsibility { get; set; }
        public string? Benefits { get; set; }
        public string TrainingSessionId { get; set; } // unique
    }
}
