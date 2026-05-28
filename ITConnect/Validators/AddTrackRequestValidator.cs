using FluentValidation;
using ITConnect.Data.RequestsModel.TrackDTOs;

namespace ITConnect.Validators
{
    public class AddTrackRequestValidator : AbstractValidator<AddTrackRequest>
    {
        public AddTrackRequestValidator()
        {
            RuleFor(x => x.Name);
            RuleFor(x => x.Description);
        }
    }
}
