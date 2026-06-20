using ITConnect.Models;

namespace ITConnect.Data.ResponsesModel.TraineeResponseModels
{
    public class TraineeOverveiwDashboardResponse
    {

        public string? TrainerName { get; set; }
        public string? TrainerGitHubAccount { get; set; }
        public string? TrainingSessionTitle { get; set; }
        public DateTime? startDate { get; set; }
        public DateTime? EndDate { get; set; }

        public List<TraineeTaskAssigenmentDto> traineeTaskAssigenmentDtos { get; set; } = new();
        public List<TraineeAnnouncementDto> traineeAnnouncementDtos { get; set; } = new();
    }
    public class TraineeTaskAssigenmentDto
    {
        public string TaskAssignmentId { get; set; }
        public string TaskTitle { get; set; }
        public string Status { get; set; }
        public DateTime AssigedAtDate { get; set; }
        public string? Feedback { get; set; }
        public string? Grad { get; set; }

    }
    public class TraineeAnnouncementDto
    {
        public string AnnouncementId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


    
