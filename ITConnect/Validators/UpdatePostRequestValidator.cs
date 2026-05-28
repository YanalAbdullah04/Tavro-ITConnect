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
                .NotEmpty()
                .Must(status => status.HasValue && (status.Value.Value == "Pending" || status.Value.Value == "Published" || status.Value.Value == "Unpublished"))
                .WithMessage("Invalid status. Allowed values are Pending, Published, or Unpublished.");
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Deadline).NotEmpty();
            RuleFor(x => x.ReqSkills).NotEmpty();
            RuleFor(x => x.Responsibility).NotEmpty();
            RuleFor(x => x.Benefits);
            RuleFor(x => x.TrainingSessionId).NotEmpty();
        }
    }
}
