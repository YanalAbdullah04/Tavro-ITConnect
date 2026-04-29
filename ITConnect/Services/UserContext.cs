using ITConnect.Services.Iservices;
using System.Security.Claims;

namespace ITConnect.Services
{
    public class UserContext : IUserContext
    {

        private readonly IHttpContextAccessor _accessor;
        public UserContext(IHttpContextAccessor accessor) => _accessor = accessor;


        public string? RawId => _accessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? _accessor.HttpContext?.User.FindFirst("sub")?.Value;

        public bool IsCompany => _accessor.HttpContext?.User.HasClaim(ClaimTypes.Role, "Company") ?? false;
        public bool IsTrainer => _accessor.HttpContext?.User.HasClaim(ClaimTypes.Role, "Trainer") ?? false;
        public bool IsTrainee => _accessor.HttpContext?.User.HasClaim(ClaimTypes.Role, "Trainee") ?? false;

        public string? CompanyId => IsCompany ? RawId : null;

        public string? TrainerId => IsTrainer ? RawId : null;

        public string? TraineeId => IsTrainee ? RawId : null;

    }
}
