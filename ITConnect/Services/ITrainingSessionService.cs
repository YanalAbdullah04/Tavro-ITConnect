using ITConnect.Data.RequestsModel.TrainingSessionDtos;
using ITConnect.Data.ResponsesModel;

namespace ITConnect.Services
{
    public interface ITrainingSessionService
    {
        public Task<bool> CreatTrainingSessionAsync(CreatTrainingSessionRequest creatTrainingSessionRequest);
        public Task<List<TrainingSessionResponse>> GetAllTrainingSessionResponseAsync();
        public Task<bool> UpdateTrainingSessionAsync(UpdateTrainingSessionRequest updateTrainingSessionRequest);
        public Task<bool> DeleteTrainingSessionAsync(string id);
    }
}
