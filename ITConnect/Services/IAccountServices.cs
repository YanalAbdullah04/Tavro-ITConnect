using ITConnect.Data;
using ITConnect.Data.RequestsModel.AuthDTOs;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repositories.UnitOfWork;
using Microsoft.AspNetCore.Identity;

namespace ITConnect.Services
{
    public interface IAccountServices
    {


        public Task<(IdentityResult Result, IdentityUser User)> RegisterBaseEntityAsync(RegisterationRequest registerCompanyRequest, string role);

        public  Task<RegistrationAuthResponse> RegisterCompanyAsync(RegisterationRequest registerCompanyRequest);
        public  Task<RegistrationAuthResponse> RegisterTraineeAsync(RegisterationRequest registerCompanyRequest);
        public Task<LoginAuthResponse> Login(LoginDto logInDto);
    }
}
