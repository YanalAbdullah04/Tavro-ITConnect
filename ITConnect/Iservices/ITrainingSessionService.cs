using ITConnect.Data.RequestsModel.TrainingSessionDtos;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.RequestsModel.TrainerDto;

namespace ITConnect.Services.Iservices
{
    public interface ITrainingSessionService
    {
        public Task<bool> CreatTrainingSessionAsync(CreatTrainingSessionRequest creatTrainingSessionRequest);
        public Task<List<TrainingSessionResponse>> GetAllTrainingSessionResponseAsync();
        public Task<bool> UpdateTrainingSessionAsync(UpdateTrainingSessionRequest updateTrainingSessionRequest);
        public Task<bool> DeleteTrainingSessionAsync(string id);
        public Task<bool> CreateAndAssignTaskAsync(string sessionId, AssignTaskRequest assignTaskRequest);
    }
}
