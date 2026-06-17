using FluentValidation;
using ITConnect.Data.RequestsModel.AuthDTOs;

namespace ITConnect.Validators
{
    public class TraineeRegistrationRequestValidator : AbstractValidator<TraineeRegistrationRequest>
    {
        public TraineeRegistrationRequestValidator()
        {
            Include(new RegisterationRequestValidator());
            RuleFor(x => x.GithubUsername)
                .NotEmpty().WithMessage("GitHub username is required.");
        }
    }
}
