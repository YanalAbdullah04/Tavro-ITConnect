using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models.Repository.cs; // Assuming IGenericRepository is here

namespace ITConnect.Models.Repositories
{
    public interface ITrainerRepository : IGenericRepository<Trainer>
    {
  
        Task<PagedResults<TrainerResponse>> GetTrainerResponsePageAsync(string? searchstring,int currentpage, int pagesize);

     
        Task<TrainerProfileResponse?> GetTrainerResponseProfileAsync(string trainerid);
        Task<TrainerDashboardOverviewResponse?> GetGetTrainerDashboardOverViewResponseAsync(string TrainerId);
        Task<PagedResults<TrainingDtoInTrainerOverview>> GetTrainerSessionsPageAsync(string trainerId, string? searchstring, int currentpage, int pagesize);
        Task<PagedResults<StudentWithinTraining>> GetTrainerTraineesPageAsync(string trainerId, string? searchstring, string? trainingSessionId, int currentpage, int pagesize);
        Task<PagedResults<TrainerTaskSubmissionsDto>> GetTaskDeliverablesPageAsync(string trainerId, string? searchstring, string? status, string? trainingSessionId, string? traineeId, int currentpage, int pagesize);
        Task<TaskEvaluationsResponse> GetTaskEvaluationsMetaAsync(string trainerId);
        Task<PagedResults<TrainerAnnouncementResponse>> GetAnnouncementsPageAsync(string trainerId, string? searchstring, string? trainingSessionId, int currentpage, int pagesize);
        Task<bool> CreateAnnouncementAsync(string trainerId, string trainingSessionId, string title, string message);
    }
}
