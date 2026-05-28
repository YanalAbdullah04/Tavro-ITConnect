using FluentValidation;
using ITConnect.Data.RequestsModel.TrackDTOs;

namespace ITConnect.Validators
{
    public class UpdateTrackRequestValidator : AbstractValidator<UpdateTrackRequest>
    {
        public UpdateTrackRequestValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
        }
    }
}
