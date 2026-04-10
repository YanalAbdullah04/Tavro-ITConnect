using ITConnect.Models;

namespace ITConnect.Data.ResponsesModel
{
    public class PostResponse
    {
        public string id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public string ReqSkills { get; set; }
        public string Status { get; set; }
        public string TrainingSessionId { get; set; } // unique
        public int NumberOfApplicants { get; set; }

    }
}
