using ITConnect.Data.RequestsModel.TrainerResponse;
using ITConnect.Data.RequestsModel.TrainerDto;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;

namespace ITConnect.Services
{
    public class TrainerService:ITrainerService
    {
        private readonly ITrainerRepository TrainerRepository;
        private readonly IAccountServices accountServices;
        private readonly IUserContext _userContext;

        private readonly ITrainingSessionRepository _trainingSessionRepository;

        public TrainerService(ITrainerRepository trainerRepository, 
            IAccountServices accountServices,
            ITrainingSessionRepository trainingSessionRepository,
            IUserContext userContext)
        {
            TrainerRepository = trainerRepository;
            this.accountServices = accountServices;
            _trainingSessionRepository = trainingSessionRepository;
            _userContext = userContext;
        }


        public async Task<PagedResults<TrainerResponse>> GetAllTrainerAsync(string searchstring, int CurentPage, int PageSize)
        {
            return await TrainerRepository.GetTrainerResponsePageAsync(searchstring, CurentPage, PageSize);
            
        }

        public async Task<TrainerProfileResponse?> GetTrainerProfileResponseAsync(string TrainerId)
        {
          bool exist= await TrainerRepository.ExistByIdAsync(TrainerId);
            if (!exist)
                return null;
           return await TrainerRepository.GetTrainerResponseProfileAsync(TrainerId);
        }

        public async Task<bool> SettingTrainerProfileAsync(SettingTrainerProfileRequest updateTrainerRequest)
        {
           var trainer= await TrainerRepository.GetByIdAsync(updateTrainerRequest.TrainerId);
            if (trainer == null)
                throw new Exception("trainer not found");
            var sucess = await accountServices.UpdateUserIdentityAsync(updateTrainerRequest.TrainerId, updateTrainerRequest.Email, updateTrainerRequest.Phone);
            if (!sucess)
                throw new Exception("failed to updatet identity");
            trainer.Name = updateTrainerRequest.Name;
            trainer.Specialization = updateTrainerRequest.Specialization;
            if (!string.IsNullOrWhiteSpace(updateTrainerRequest.GithubUsername))
                trainer.GithubUsername = updateTrainerRequest.GithubUsername;
            if (!string.IsNullOrWhiteSpace(updateTrainerRequest.ImgUrl))
                trainer.ImgUrl = updateTrainerRequest.ImgUrl;
      
            return await  TrainerRepository.UpdateAsync(trainer.Id, trainer);
        }
        public async Task<bool> DeleteTrainerAsync(string trainerid)
        {
            var trainer = await TrainerRepository.GetByIdAsync(trainerid);
            if (trainer == null)
                throw new Exception("trainer not found");
            return await accountServices.DeleteUserAccountAsync(trainerid);
        }

        public async Task<TrainerDashboardOverviewResponse?> GetTrainerDashboardAsync()
        {
            var trainerId = _userContext.TrainerId;
            if (string.IsNullOrEmpty(trainerId))
            {
                throw new Exception("Trainer ID not found in context");
            }
            return await TrainerRepository.GetGetTrainerDashboardOverViewResponseAsync(trainerId);
        }

        public async Task<TrainingSessionDetailesResponse?> GetTrainingSessionDetailesResponseAsync(string id)
        {
            //trainingsession is filtered using global query , no need to get useres here 
            //if anything went wrong with this endpoitn try to use ignore qeurey and get the user id and test if it works 
            if (string.IsNullOrEmpty(id))
                return null;
                
            return await _trainingSessionRepository.GetTrainingSessionDetailesResponseAsync(id);
        }

        public async Task<PagedResults<TrainingDtoInTrainerOverview>> GetTrainerSessionsAsync(string? searchstring, int CurentPage, int PageSize)
        {
            var trainerId = GetCurrentTrainerId();
            return await TrainerRepository.GetTrainerSessionsPageAsync(trainerId, searchstring, CurentPage, PageSize);
        }

        public async Task<PagedResults<StudentWithinTraining>> GetTrainerTraineesAsync(string? searchstring, string? trainingSessionId, int CurentPage, int PageSize)
        {
            var trainerId = GetCurrentTrainerId();
            return await TrainerRepository.GetTrainerTraineesPageAsync(trainerId, searchstring, trainingSessionId, CurentPage, PageSize);
        }

        public async Task<PagedResults<TrainerTaskSubmissionsDto>> GetTaskDeliverablesAsync(string? searchstring, string? status, string? trainingSessionId, string? traineeId, int CurentPage, int PageSize)
        {
            var trainerId = GetCurrentTrainerId();
            return await TrainerRepository.GetTaskDeliverablesPageAsync(trainerId, searchstring, status, trainingSessionId, traineeId, CurentPage, PageSize);
        }

        public async Task<TaskEvaluationsResponse> GetTaskEvaluationsMetaAsync()
        {
            var trainerId = GetCurrentTrainerId();
            return await TrainerRepository.GetTaskEvaluationsMetaAsync(trainerId);
        }

        public async Task<PagedResults<TrainerAnnouncementResponse>> GetAnnouncementsAsync(string? searchstring, string? trainingSessionId, int CurentPage, int PageSize)
        {
            var trainerId = GetCurrentTrainerId();
            return await TrainerRepository.GetAnnouncementsPageAsync(trainerId, searchstring, trainingSessionId, CurentPage, PageSize);
        }

        public async Task<bool> CreateAnnouncementAsync(AnnouncementRequest request)
        {
            var trainerId = GetCurrentTrainerId();
            if (string.IsNullOrWhiteSpace(request.TrainingSessionId) ||
                string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Message))
                return false;

            return await TrainerRepository.CreateAnnouncementAsync(
                trainerId,
                request.TrainingSessionId,
                request.Title.Trim(),
                request.Message.Trim());
        }

        private string GetCurrentTrainerId()
        {
            var trainerId = _userContext.TrainerId;
            if (string.IsNullOrEmpty(trainerId))
            {
                throw new Exception("Trainer ID not found in context");
            }

            return trainerId;
        }
    }
}
