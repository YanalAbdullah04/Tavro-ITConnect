using FluentValidation;
using ITConnect.Data.RequestsModel.TrainingSessionDtos;

namespace ITConnect.Validators
{
    public class UpdateTrainingSessionRequestValidator : AbstractValidator<UpdateTrainingSessionRequest>
    {
        public UpdateTrainingSessionRequestValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.TrainingStatus).IsInEnum();
            RuleFor(x => x.Location).NotEmpty();
            RuleFor(x => x.StartDate)
                .NotEmpty();
            RuleFor(x => x.EndDate)
                .NotEmpty()
                .GreaterThan(x => x.StartDate).WithMessage("End date must be after the start date.");
            RuleFor(x => x.SeatsNumber).NotEmpty();
            RuleFor(x => x.TrackId).NotEmpty();
            RuleFor(x => x.TrainerId).NotEmpty();
        }
    }
}
