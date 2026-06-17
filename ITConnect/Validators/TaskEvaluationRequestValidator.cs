using FluentValidation;
using ITConnect.Data.RequestsModel.TrainerDto;

namespace ITConnect.Validators
{
    public class TaskEvaluationRequestValidator : AbstractValidator<TaskEvaluationRequest>
    {
        public TaskEvaluationRequestValidator()
        {
            RuleFor(x => x)
                .Must(x => !string.IsNullOrWhiteSpace(x.Feedback) || !string.IsNullOrWhiteSpace(x.Grade))
                .WithMessage("Feedback or grade is required.");
        }
    }
}
