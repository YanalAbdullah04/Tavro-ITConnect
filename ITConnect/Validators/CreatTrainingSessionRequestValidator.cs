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
            RuleFor(x => x.Location).NotEmpty();
            RuleFor(x => x.StartDate)
                .NotEmpty()
                .GreaterThanOrEqualTo(System.DateTime.Today).WithMessage("Start date must be today or in the future.");
            RuleFor(x => x.EndDate)
                .NotEmpty()
                .GreaterThan(x => x.StartDate).WithMessage("End date must be after the start date.");
            RuleFor(x => x.SeatsNumber).NotEmpty();
            RuleFor(x => x.TrackId).NotEmpty();
            RuleFor(x => x.TrainerId).NotEmpty();
        }
    }
}
