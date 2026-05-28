using FluentValidation;
using ITConnect.Data.RequestsModel.AuthDTOs;

namespace ITConnect.Validators
{
    public class RegisterationRequestValidator : AbstractValidator<RegisterationRequest>
    {
        public RegisterationRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Phone).NotEmpty().Length(10,14);
            RuleFor(x => x.Password).Length(5,25);
        }
    }
}
