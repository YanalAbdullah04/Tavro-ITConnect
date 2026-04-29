using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;

namespace ITConnect.Services
{
    public class TraineeService :ITraineeService 
    {
        private readonly ITraineeRepository traineeRepository;
        private readonly IUserContext userContext;

        public TraineeService(ITraineeRepository traineeRepository,IUserContext userContext)
        {
            this.traineeRepository = traineeRepository;
            this.userContext = userContext;
        }


        public async Task<TraineeProfileRequestAndResponse> GetTraineeProfileAsync(string? TraineeId)//for trainee and company access
        {
            if (string.IsNullOrEmpty(TraineeId))
                TraineeId = userContext.TraineeId;
            var exists = await traineeRepository.ExistByIdAsync(TraineeId);
            if (!exists)
                return null;

                var profile=await  traineeRepository.GetTraineeResponseAsync(TraineeId);
            return profile;

            

        }

        public async Task<bool> UpdateTraineeProfileAsync(TraineeProfileRequestAndResponse traineeProfileRequestAndResponse)

        {
            var Trainee = await traineeRepository.GetByIdAsync(userContext.TraineeId);
            if (Trainee == null)
                return false;

            Trainee.PortfolioLink=traineeProfileRequestAndResponse.PortfolioLink;
            Trainee.ResumeUrl = traineeProfileRequestAndResponse.ResumeUrl;
            Trainee.Name=traineeProfileRequestAndResponse.Name;
            Trainee.ImageUrl=traineeProfileRequestAndResponse.ImageUrl;
            Trainee.Skills = traineeProfileRequestAndResponse.Skills;
            

            return await traineeRepository.UpdateAsync(Trainee.Id,Trainee);
        }
    }
}
