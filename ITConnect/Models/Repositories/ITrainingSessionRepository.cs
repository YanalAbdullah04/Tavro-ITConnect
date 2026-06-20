using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models.Repository.cs;
using ITConnect.Models;

namespace ITConnect.Models.Repositories
{
    public interface ITrainingSessionRepository :IGenericRepository<TrainingSession>
    {
        IQueryable<TrainingSessionResponse> GetTrainingSessionResponseQuery();
        Task<TrainingSessionResponse> GetTrainingSessionResponsAsync(TrainingSession trainingSession);
        Task<List<TrainingSessionResponse>> GetTrainingSessionResponseAsync();
        Task<TrainingSessionDetailesResponse?> GetTrainingSessionDetailesResponseAsync(string sessionId);
        Task<bool> CreateAndAssignTaskAsync(ApplicationTask task, List<string>? traineeIds, bool includeAll);
        Task ReassignTrainerAsync(string sessionId, string newTrainerId);
    }
}
