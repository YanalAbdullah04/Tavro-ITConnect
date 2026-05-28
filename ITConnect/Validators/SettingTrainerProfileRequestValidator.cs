using FluentValidation;
using ITConnect.Data.RequestsModel.TrainerResponse;

namespace ITConnect.Validators
{
    public class SettingTrainerProfileRequestValidator : AbstractValidator<SettingTrainerProfileRequest>
    {
        public SettingTrainerProfileRequestValidator()
        {
            RuleFor(x => x.TrainerId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Email).NotEmpty();
            RuleFor(x => x.Phone).NotEmpty();

        }
    }
}
