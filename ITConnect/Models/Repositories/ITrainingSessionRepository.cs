using ITConnect.Data.ResponsesModel.TrainingSession;
using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories
{
    public interface ITrainingSessionRepository :IGenericRepository<TrainingSession>
    {
        IQueryable<TrainingSessionResponse> GetTrainingSessionResponseQuery();
        Task<TrainingSessionResponse> GetTrainingSessionResponsAsync(TrainingSession trainingSession);
        Task<List<TrainingSessionResponse>> GetTrainingSessionResponseAsync();
    }
}
