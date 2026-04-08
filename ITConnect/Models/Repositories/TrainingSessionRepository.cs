using ITConnect.Data;
using ITConnect.Data.ResponsesModel.TrainingSession;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class TrainingSessionRepository : GenericRepository<TrainingSession>, ITrainingSessionRepository
    {
        public TrainingSessionRepository( ApplicationDbContext dbContext) : base(dbContext) 
        {
            
        }
        public async  Task<TrainingSessionResponse> GetTrainingSessionResponsAsync(TrainingSession trainingSession)
        {
            return await GetTrainingSessionResponseQuery().SingleOrDefaultAsync(t=>t.Id==trainingSession.Id);
        }

        public async Task<List<TrainingSessionResponse>> GetTrainingSessionResponseAsync()
        {
            return await GetTrainingSessionResponseQuery().ToListAsync();  
        }

        public   IQueryable<TrainingSessionResponse> GetTrainingSessionResponseQuery()
        {
            var result = Db.TrainingSessions.Select(x =>
                new TrainingSessionResponse()
                {
                    Id = x.Id,
                    Description = x.Description,
                    EndDate = x.EndDate,
                    Location = x.Location,
                    SeatsNumber = x.SeatsNumber,
                    StartDate = x.StartDate,
                    TrackId = x.TrackId,
                    TrainerId = x.TrainerId,
                    TrainingStatus = x.TrainingStatus,
                    TrainingSessionName = x.Name,
                    TrainerName = Db.Trainers.Select(t => t.Name).Single(),
                    TrackName = Db.Tracks.Where(t=>t.Id==x.TrackId).Select(t=>t.Name).Single()
                }
            );
            return result;         
        }
    }
}
