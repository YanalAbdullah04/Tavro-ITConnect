using ITConnect.Models;
namespace ITConnect.Data.ResponsesModel
{
    public class ApplicantResponse
    {
        public string ApplicantId { get; set; }
        public string TraineeId { get; set; }
        public string TraineeName { get; set; }
        public string TraineeEmail { get; set; }

        public string TrainingSessionId { get; set; }
        public ApplicantStatus Status { get; set; } = ApplicantStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string TrackId { get; set; }
        public string TrackName { get; set; }


    }
}
