using FluentValidation;
using ITConnect.Data.RequestsModel.TraineeDtos;

namespace ITConnect.Validators
{
    public class TaskSubmissionRequestValidator : AbstractValidator<TaskSubmissionRequest>
    {
        public TaskSubmissionRequestValidator()
        {
            RuleFor(x => x.TaskAssignmentId).NotEmpty();
            RuleFor(x => x.GithubRepo).NotEmpty();
            RuleFor(x => x.GithubBranch).NotEmpty();
            RuleFor(x => x.GithubRepoUrl).NotEmpty();
        }
    }
}
