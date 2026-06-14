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

        public async Task<TrainingSessionDetailesResponse> GetTrainingSessionDetailesResponseAsync(string sessionId)
        {
            // First check if it exists at all (ignoring filters) to provide a better error message
            var existsUnfiltered = await Db.TrainingSessions.IgnoreQueryFilters().AnyAsync(ts => ts.Id == sessionId || ts.Id == sessionId.ToLower() || ts.Id == sessionId.ToUpper());
            
            var session = await Db.TrainingSessions.FirstOrDefaultAsync(ts => ts.Id == sessionId || ts.Id == sessionId.ToLower() || ts.Id == sessionId.ToUpper());
            
            if (session == null)
            {
                if (existsUnfiltered)
                {
                    throw new UnauthorizedAccessException("The training session exists, but your current UserContext.TrainerId does not have permission to access it due to the Global Query Filter.");
                }
                return null;
            }

            var taskCount = await Db.ApplicationTask.CountAsync(t => t.TrainingSessionId == sessionId);

            var traineesQuery = Db.Trainees
                .IgnoreQueryFilters()
                .Where(t => t.TrainingSessionId == sessionId);

            var numberOfStudents = await traineesQuery.CountAsync();

            var students = await traineesQuery.Select(t => new StudentWithinTraining
            {
                StudentId = t.Id,
                StudentName = t.Name,
                Email = t.User.Email,
                NumberOfTasks = Db.TaskAssignments.Count(ta => ta.TraineeId == t.Id && ta.ApplicationTask.TrainingSessionId == sessionId)
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
            var sessionExists = await Db.TrainingSessions.IgnoreQueryFilters().AnyAsync(ts => ts.Id == task.TrainingSessionId);
            if (!sessionExists)
            {
                return false;
            }

            Db.ApplicationTask.Add(task);

            if (includeAll)
            {
                var trainees = await Db.Trainees
                    .IgnoreQueryFilters()
                    .Where(t => t.TrainingSessionId == task.TrainingSessionId)
                    .ToListAsync();

                foreach (var trainee in trainees)
                {
                    var assignment = new TaskAssignment
                    {
                        Id = Guid.NewGuid().ToString(),
                        ApplicationTaskId = task.Id,
                        TraineeId = trainee.Id,
                        Status = false,
                        AssignedAt = DateTime.UtcNow
                    };
                    Db.TaskAssignments.Add(assignment);
                }
            }
            else if (traineeIds != null && traineeIds.Any())
            {
                foreach (var traineeId in traineeIds)
                {
                    var traineeExists = await Db.Trainees
                        .IgnoreQueryFilters()
                        .AnyAsync(t => t.Id == traineeId && t.TrainingSessionId == task.TrainingSessionId);

                    if (traineeExists)
                    {
                        var assignment = new TaskAssignment
                        {
                            Id = Guid.NewGuid().ToString(),
                            ApplicationTaskId = task.Id,
                            TraineeId = traineeId,
                            Status = false,
                            AssignedAt = DateTime.UtcNow
                        };
                        Db.TaskAssignments.Add(assignment);
                    }
                }
            }

            return await Db.SaveChangesAsync() > 0;
        }
    }
}
