using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;
using ITConnect.Models;

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
                    IsPaid = x.IsPaid,
                    EndDate = x.EndDate,
                    Location = x.Location,
                    SeatsNumber = x.SeatsNumber,
                    StartDate = x.StartDate,
                    TrackId = x.TrackId,
                    TrainerId = x.TrainerId,
                    TrainingStatus = x.TrainingStatus,
                    TrainingSessionName = x.Name,
                    TrainerName = x.Trainer.Name,
                    TrackName = x.Track.Name,
                    RegisteredStudentsCount=Db.Trainees.Count(s=>s.TrainingSessionId==x.Id)
                }
            );
            return result;         
        }

        public async Task<TrainingSessionDetailesResponse?> GetTrainingSessionDetailesResponseAsync(string sessionId)
        {
            var session = await Db.TrainingSessions.FirstOrDefaultAsync(ts => ts.Id == sessionId);
            if (session == null)
                return null;

            var taskCount = await Db.ApplicationTask.CountAsync(t => t.TrainingSessionId == session.Id);

            var traineesQuery = Db.Trainees
                .Where(t => t.TrainingSessionId == session.Id);

            var numberOfStudents = await traineesQuery.CountAsync();

            var students = await traineesQuery.Select(t => new StudentWithinTraining
            {
                StudentId = t.Id,
                StudentName = t.Name,
                Email = t.User.Email,
                NumberOfTasks = Db.TaskAssignments.Count(ta => ta.TraineeId == t.Id && ta.ApplicationTask.TrainingSessionId == session.Id)
            }).ToListAsync();

            return new TrainingSessionDetailesResponse
            {
                TrainingSessionName = session.Name,
                StartDate = session.StartDate,
                EndDate = session.EndDate,
                NumberOfStudents = numberOfStudents,
                TaskCount = taskCount,
                StudentsWithinTraining = students
            };
        }

        public async Task<bool> CreateAndAssignTaskAsync(ApplicationTask task, List<string>? traineeIds, bool includeAll)
        {
            var session = await Db.TrainingSessions.SingleOrDefaultAsync(ts => ts.Id == task.TrainingSessionId);
            if (session == null)
                return false;

            task.TrainingSessionId = session.Id;
            List<Trainee> trainees;

            if (includeAll)
            {
                trainees = await Db.Trainees
                    .Where(t => t.TrainingSessionId == task.TrainingSessionId)
                    .ToListAsync();
            }
            else
            {
                var requestedIds = traineeIds?.Distinct().ToList() ?? [];
                trainees = await Db.Trainees
                    .Where(t => t.TrainingSessionId == task.TrainingSessionId && requestedIds.Contains(t.Id))
                    .ToListAsync();

                if (requestedIds.Count == 0 || trainees.Count != requestedIds.Count)
                    return false;
            }

            Db.ApplicationTask.Add(task);
            foreach (var trainee in trainees)
            {
                Db.TaskAssignments.Add(new TaskAssignment
                {
                    Id = Guid.NewGuid().ToString(),
                    ApplicationTaskId = task.Id,
                    TraineeId = trainee.Id,
                    Status = false,
                    AssignedAt = DateTime.UtcNow
                });
            }

            return await Db.SaveChangesAsync() > 0;
        }
    }
}
