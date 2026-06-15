using FluentValidation;
using ITConnect.Data.RequestsModel.AuthDTOs;

namespace ITConnect.Validators
{
    public class TrainerRegistrationRequestValidator : AbstractValidator<TrainerRegistrationRequest>
    {
        public TrainerRegistrationRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty();
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Phone).NotEmpty();
        }
    }
}
