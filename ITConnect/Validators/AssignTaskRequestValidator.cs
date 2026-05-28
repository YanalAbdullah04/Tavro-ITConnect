using FluentValidation;
using ITConnect.Data.RequestsModel.TrainerDto;

namespace ITConnect.Validators
{
    public class AssignTaskRequestValidator : AbstractValidator<AssignTaskRequest>
    {
        public AssignTaskRequestValidator()
        {
            RuleFor(x => x.TaskTitle).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Notes).NotEmpty();
            RuleFor(x => x.Deadline).NotEmpty();        
        }
    }
}
