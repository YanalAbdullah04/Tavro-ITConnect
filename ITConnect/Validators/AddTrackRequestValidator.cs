using FluentValidation;
using ITConnect.Data.RequestsModel.TrackDTOs;

namespace ITConnect.Validators
{
    public class AddTrackRequestValidator : AbstractValidator<AddTrackRequest>
    {
        public AddTrackRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
        }
    }
}
