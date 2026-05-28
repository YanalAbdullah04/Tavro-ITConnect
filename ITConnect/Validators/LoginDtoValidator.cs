using FluentValidation;
using ITConnect.Data.RequestsModel.AuthDTOs;

namespace ITConnect.Validators
{
    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().WithMessage("Email is required").EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }
}
