using ITConnect.Models;

namespace ITConnect.Data.ResponsesModel.TraineeResponseModels
{
    public class TraineeTaskDetailesResponse
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Notes { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public DateTime Deadline { get; set; }
        public string? AttachmentUrl { get; set; }
        public string TrainingSessionId { get; set; }
        public string trainerName { get; set; }
        public bool Status { get; set; }


    }
}
