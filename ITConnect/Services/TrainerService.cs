using ITConnect.Data.RequestsModel.TrainerResponse;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;

namespace ITConnect.Services
{
    public class TrainerService:ITrainerService
    {
        private readonly ITrainerRepository TrainerRepository;
        private readonly IAccountServices accountServices;

        public TrainerService(ITrainerRepository trainerRepository,IAccountServices accountServices)
        {
            TrainerRepository = trainerRepository;
            this.accountServices = accountServices;
        }


        public async Task<PagedResults<TrainerResponse>> GetAllTrainerAsync(string searchstring, int CurentPage, int PageSize)
        {
            return await TrainerRepository.GetTrainerResponsePageAsync(searchstring, CurentPage, PageSize);
            
        }

        public async Task<TrainerProfileResponse> GetTrainerProfileResponseAsync(string TrainerId)
        {
          bool exist= await TrainerRepository.ExistByIdAsync(TrainerId);
            if (!exist)
                return null;
           return await TrainerRepository.GetTrainerResponseProfileAsync(TrainerId);
        }

        public async Task<bool> UpdateTrainerProfileAsync(UpdateTrainerRequest updateTrainerRequest)
        {
           var trainer= await TrainerRepository.GetByIdAsync(updateTrainerRequest.TrainerId);
            if (trainer == null)
                throw new Exception("trainer not found");
            var sucess = await accountServices.UpdateUserIdentityAsync(updateTrainerRequest.TrainerId, updateTrainerRequest.Email, updateTrainerRequest.Phone);
            if (!sucess)
                throw new Exception("failed to updatet identity");
            trainer.Name = updateTrainerRequest.Name;
            trainer.Specialization = updateTrainerRequest.Specialization; 
      
            return await  TrainerRepository.UpdateAsync(trainer.Id, trainer);
        }
        public async Task<bool> DeleteTrainerAsync(string trainerid)
        {
            var trainer = await TrainerRepository.GetByIdAsync(trainerid);
            if (trainer == null)
                throw new Exception("trainer not found");
            return await accountServices.DeleteUserAccountAsync(trainerid);
        }
    }
}
