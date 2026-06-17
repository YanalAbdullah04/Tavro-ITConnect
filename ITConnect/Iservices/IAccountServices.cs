using ITConnect.Data;
using ITConnect.Data.RequestsModel.AuthDTOs;
using ITConnect.Data.RequestsModel.TrainerDto;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repositories.UnitOfWork;
using Microsoft.AspNetCore.Identity;

namespace ITConnect.Services.Iservices
{
    public class TrainerProfileSettingResult
    {
        public bool IsSuccess { get; set; }
        public bool IsAlreadyCompleted { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public interface IAccountServices
    {


        public Task<(IdentityResult Result, IdentityUser User)> RegisterBaseEntityAsync(RegisterationRequest registerCompanyRequest, string role);

        public  Task<RegistrationAuthResponse> RegisterCompanyAsync(RegisterationRequest registerCompanyRequest);
        public  Task<RegistrationAuthResponse> RegisterTraineeAsync(TraineeRegistrationRequest registerTraineeRequest);
        public  Task<RegistrationAuthResponse> RegisterTrainerAsync(TrainerRegistrationRequest TrainerRegisterationRequest);

        public Task<LoginAuthResponse> Login(LoginDto logInDto);
        public Task<bool> UpdateUserIdentityAsync(string userId, string email, string phone);
        public Task<TrainerProfileSettingResult> SettingTrainerProfileAsync(TrainerProfileSettingRequest trainerProfileSettingRequest);
        public Task<bool> DeleteUserAccountAsync(string userId);

    }
}
