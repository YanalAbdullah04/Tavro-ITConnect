using ITConnect.Data.RequestsModel.TrackDTOs;
using ITConnect.Data.RequestsModel.TrainerDto;
using ITConnect.Data.RequestsModel.TrainerResponse;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;

namespace ITConnect.Services
{

    public interface ITrainerService
    {
        public Task<PagedResults<TrainerResponse>> GetAllTrainerAsync(string searchstring, int CurentPage, int PageSize);
        public Task<TrainerProfileResponse?> GetTrainerProfileResponseAsync(string TrainerId);
        Task<bool> SettingTrainerProfileAsync(SettingTrainerProfileRequest settingTrainerProfileRequest);
        public Task<bool> DeleteTrainerAsync(string Trainer);
        public Task<TrainerDashboardOverviewResponse?> GetTrainerDashboardAsync();
        public Task<TrainingSessionDetailesResponse?> GetTrainingSessionDetailesResponseAsync(string id);
        Task<PagedResults<TrainingDtoInTrainerOverview>> GetTrainerSessionsAsync(string? searchstring, int CurentPage, int PageSize);
        Task<PagedResults<StudentWithinTraining>> GetTrainerTraineesAsync(string? searchstring, string? trainingSessionId, int CurentPage, int PageSize);
        Task<PagedResults<TrainerTaskSubmissionsDto>> GetTaskDeliverablesAsync(string? searchstring, string? status, string? trainingSessionId, string? traineeId, int CurentPage, int PageSize);
        Task<TaskEvaluationsResponse> GetTaskEvaluationsMetaAsync();
        Task<PagedResults<TrainerAnnouncementResponse>> GetAnnouncementsAsync(string? searchstring, string? trainingSessionId, int CurentPage, int PageSize);
        Task<bool> CreateAnnouncementAsync(AnnouncementRequest request);
        
    }

}
