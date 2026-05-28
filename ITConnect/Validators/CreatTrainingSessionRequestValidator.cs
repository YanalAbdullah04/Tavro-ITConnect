using FluentValidation;
using ITConnect.Data.RequestsModel.TrainingSessionDtos;

namespace ITConnect.Validators
{
    public class CreatTrainingSessionRequestValidator : AbstractValidator<CreatTrainingSessionRequest>
    {
        public CreatTrainingSessionRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.IsPaid).NotEmpty();
            RuleFor(x => x.Location).NotEmpty();
            RuleFor(x => x.StartDate).NotEmpty();
            RuleFor(x => x.EndDate).NotEmpty();
            RuleFor(x => x.SeatsNumber).NotEmpty();
            RuleFor(x => x.TrackId).NotEmpty();
            RuleFor(x => x.TrainerId).NotEmpty();
        }
    }
}
