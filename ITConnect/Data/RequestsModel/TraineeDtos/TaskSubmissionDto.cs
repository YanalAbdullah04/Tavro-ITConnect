namespace ITConnect.Data.RequestsModel.TraineeDtos
{

    public class TaskSubmissionDto
    {
        public string GithubRepo { get; set; }
        public string GithubBranch { get; set; }
        public string GithubRepoUrl { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
