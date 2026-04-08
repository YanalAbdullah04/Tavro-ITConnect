namespace ITConnect.Models
{

    public class TaskSubmission :BaseEntity
    {
        public string TaskAssignmentId { get; set; }
        public TaskAssignment TaskAssignment { get; set; }


        public string GithubRepo { get; set; }
        public string GithubBranch { get; set; }
        public string GithubCommitSha { get; set; }
        public string GithubRepoUrl { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.Now;


        public string SubmittedBy { get; set; } // trainee_id
        public Trainee Trainee { get; set; }


        public string SubmittedTo { get; set; } // trainer_id
        public Trainer Trainer { get; set; }

        public string TrainingSessionId { get; set; }
        public TrainingSession TrainingSession { get; set; }
    }

}
