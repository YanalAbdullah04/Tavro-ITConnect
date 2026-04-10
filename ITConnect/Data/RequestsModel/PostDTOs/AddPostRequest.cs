using ITConnect.Models;

namespace ITConnect.Data.RequestsModel.PostDTOs
{
    public class AddPostRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public string ReqSkills { get; set; }
        public string Responsibility { get; set; }
        public string Benefits { get; set; }
        public string? Status { get; set; }
        public string TrainingSessionId { get; set; } // unique


    }
}
