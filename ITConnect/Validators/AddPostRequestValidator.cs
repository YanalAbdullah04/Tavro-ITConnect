using FluentValidation;
using ITConnect.Data.RequestsModel.PostDTOs;

namespace ITConnect.Validators
{
    public class AddPostRequestValidator : AbstractValidator<AddPostRequest>
    {
        public AddPostRequestValidator()
        {
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Deadline).NotEmpty();
            RuleFor(x => x.ReqSkills).NotEmpty();
            RuleFor(x => x.Responsibility).NotEmpty();
            RuleFor(x => x.TrainingSessionId).NotEmpty();
        }
    }
}
