using FluentValidation;
using ITConnect.Data.RequestsModel.TrainerDto;

namespace ITConnect.Validators
{
    public class TrainerProfileSettingRequestValidator : AbstractValidator<TrainerProfileSettingRequest>
    {
        public TrainerProfileSettingRequestValidator()
        {
            RuleFor(x => x.Password).NotEmpty();
        }
    }
}
