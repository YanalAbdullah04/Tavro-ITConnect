namespace ITConnect.Data.ResponsesModel.TrainerResponseModels
{
    public class TaskAssigementsAndSubmissionsResponseModel
    {
        public List<TrainerTaskSubmissionsDto> TrainerTaskSubmissionsDtos { get; set; }
    }

    public class TrainerTaskSubmissionsDto
    {
        public string TaskAssignmentId { get; set; }
        public string TaskTitle { get; set; }
        public string Status { get; set; }
        public string? TraineeId { get; set; }
        public string? TraineeName { get; set; }
        public string? TraineeEmail { get; set; }
        public string? TrainingSessionId { get; set; }
        public string? TrainingSessionName { get; set; }
        public DateTime? Deadline { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public string? Feedback { get; set; }
        public string? Grade { get; set; }

        // Submission/repo data (null when not submitted)
        public string? GithubRepo { get; set; }
        public string? GithubBranch { get; set; }
        public string? GithubRepoUrl { get; set; }
        public string? GithubOwner { get; set; }
    }
}
