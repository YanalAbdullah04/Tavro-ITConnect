using FluentValidation;
using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Models;

namespace ITConnect.Validators
{
    public class UpdatePostRequestValidator : AbstractValidator<UpdatePostRequest>
    {
        public UpdatePostRequestValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Status)
                .Must(status => status.HasValue && (status.Value.Value == "Pending" || status.Value.Value == "Published" || status.Value.Value == "Unpublished"))
                .When(x => x.Status.HasValue)
                .WithMessage("Invalid status. Allowed values are Pending, Published, or Unpublished.");
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Deadline).NotEmpty();
            RuleFor(x => x.ReqSkills).NotEmpty();
            RuleFor(x => x.Responsibility).NotEmpty();
            RuleFor(x => x.TrainingSessionId).NotEmpty();
        }
    }
}
