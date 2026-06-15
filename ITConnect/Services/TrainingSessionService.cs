using ITConnect.Data.RequestsModel.TrainingSessionDtos;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;
using System.IO;
using ITConnect.Data.RequestsModel.TrainerDto;

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
            var now = DateTime.Now;
            var initialStatus = now >= creatTrainingSessionRequest.EndDate ? TrainingStatus.Complete :
                                now >= creatTrainingSessionRequest.StartDate ? TrainingStatus.InComplete :
                                TrainingStatus.Pending;

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
                TrainingStatus = initialStatus,
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
            
            if (updateTrainingSessionRequest.TrainingStatus == TrainingStatus.Complete)
            {
                trainingSession.EndDate = DateTime.Now;
            }
            else
            {
                trainingSession.EndDate = updateTrainingSessionRequest.EndDate;
            }
            
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

        public async Task<bool> CreateAndAssignTaskAsync(string sessionId, AssignTaskRequest assignTaskRequest)
        {
            if (string.IsNullOrEmpty(userContext.TrainerId) || !await trainingSessionRepository.ExistByIdAsync(sessionId))
                return false;

            string? attachmentUrl = null;
            if (assignTaskRequest.Attachment != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(assignTaskRequest.Attachment.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await assignTaskRequest.Attachment.CopyToAsync(stream);
                }

                attachmentUrl = "/uploads/" + fileName;
            }

            var task = new ApplicationTask
            {
                Id = Guid.NewGuid().ToString(),
                Title = assignTaskRequest.TaskTitle,
                Description = assignTaskRequest.Description,
                Notes = assignTaskRequest.Notes ?? string.Empty,
                Deadline = assignTaskRequest.Deadline,
                TrainingSessionId = sessionId,
                TrainerId = userContext.TrainerId,
                AssignedAt = DateTime.UtcNow,
                AttachmentUrl = attachmentUrl
            };

            return await trainingSessionRepository.CreateAndAssignTaskAsync(task, assignTaskRequest.TraineesId, assignTaskRequest.IncludeAll);
        }
    }
}

