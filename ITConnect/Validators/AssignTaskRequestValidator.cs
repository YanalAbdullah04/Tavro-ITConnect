using FluentValidation;
using ITConnect.Data.RequestsModel.TrainerDto;

namespace ITConnect.Validators
{
    public class AssignTaskRequestValidator : AbstractValidator<AssignTaskRequest>
    {
        public AssignTaskRequestValidator()
        {
            RuleFor(x => x.TaskTitle).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Deadline)
                .NotEmpty()
                .GreaterThanOrEqualTo(System.DateTime.Today).WithMessage("Deadline must be today or in the future.");
            RuleFor(x => x.TraineesId)
                .NotEmpty()
                .When(x => !x.IncludeAll)
                .WithMessage("Select at least one trainee when IncludeAll is false.");
        }
    }
}
