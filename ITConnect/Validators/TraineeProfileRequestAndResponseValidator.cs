using FluentValidation;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;

namespace ITConnect.Validators
{
    public class TraineeProfileRequestAndResponseValidator : AbstractValidator<TraineeProfileRequestAndResponse>
    {
        public TraineeProfileRequestAndResponseValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
        }
    }
}
