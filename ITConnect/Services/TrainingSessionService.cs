using ITConnect.Data.RequestsModel.TrainingSessionDtos;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;

namespace ITConnect.Services
{
    public class TrainingSessionService : ITrainingSessionService
    {
        private readonly ITrainingSessionRepository trainingSessionRepository;
        private readonly IUserContext userContext;

        public TrainingSessionService(ITrainingSessionRepository trainingSessionRepository, IUserContext userContext)
        {
            this.trainingSessionRepository = trainingSessionRepository;
            this.userContext = userContext;
        }

        public async Task<bool> CreatTrainingSessionAsync(CreatTrainingSessionRequest creatTrainingSessionRequest)
        {
            TrainingSession trainingSession = new TrainingSession()
            {
                Name = creatTrainingSessionRequest.Name,
                CompanyId = userContext.CompanyId,
                Description = creatTrainingSessionRequest.Description,
                EndDate = creatTrainingSessionRequest.EndDate,
                Location = creatTrainingSessionRequest.Location,
                IsPaid = creatTrainingSessionRequest.IsPaid,
                SeatsNumber = creatTrainingSessionRequest.SeatsNumber,
                StartDate = creatTrainingSessionRequest.StartDate,
                TrackId = creatTrainingSessionRequest.TrackId,
                TrainerId = creatTrainingSessionRequest.TrainerId,
                TrainingStatus = "Pending",
            };

            return await trainingSessionRepository.AddAsync(trainingSession);
        }
        public async Task<List<TrainingSessionResponse>> GetAllTrainingSessionResponseAsync()
        {
            return await trainingSessionRepository.GetTrainingSessionResponseAsync();
        }

        public async Task<bool> UpdateTrainingSessionAsync(UpdateTrainingSessionRequest updateTrainingSessionRequest)
        {
            var trainingSession = await trainingSessionRepository.GetByIdAsync(updateTrainingSessionRequest.Id);
            if (trainingSession == null)
                return false;
            trainingSession.Name = updateTrainingSessionRequest.Name;
            trainingSession.IsPaid = updateTrainingSessionRequest.IsPaid;
            trainingSession.Location = updateTrainingSessionRequest.Location;
            trainingSession.SeatsNumber = updateTrainingSessionRequest.SeatsNumber;
            trainingSession.Id = updateTrainingSessionRequest.Id;
            trainingSession.Description = updateTrainingSessionRequest.Description;
            trainingSession.CompanyId = userContext.CompanyId;
            trainingSession.EndDate = updateTrainingSessionRequest.EndDate;
            trainingSession.StartDate = updateTrainingSessionRequest.StartDate;
            trainingSession.TrackId = updateTrainingSessionRequest.TrackId;
            trainingSession.TrainerId = updateTrainingSessionRequest.TrainerId;
            trainingSession.TrainingStatus = updateTrainingSessionRequest.TrainingStatus;

            return await trainingSessionRepository.UpdateAsync(trainingSession.Id, trainingSession);
        }
        public async Task<bool> DeleteTrainingSessionAsync(string id)
        {
            var result= await trainingSessionRepository.ExistByIdAsync(id);
            if (!result)
                return false;
            return await trainingSessionRepository.DeleteAsync(id, null);

        }

    }
}


