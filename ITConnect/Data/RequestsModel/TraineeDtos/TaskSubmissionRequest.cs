namespace ITConnect.Data.RequestsModel.TraineeDtos
{
    public class TaskSubmissionRequest
    {
        public string TaskAssignmentId { get; set; }
        public string GithubRepo { get; set; }
        public string GithubBranch { get; set; }
        public string GithubCommitSha { get; set; }
        public string GithubRepoUrl { get; set; }
    }

}
