
using ITConnect.Data;
using ITConnect.Data.ResponseModel;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace ITConnect.Models.Repositories
{
    public class TraineeRepository : GenericRepository<Trainee>, ITraineeRepository
    {
        public TraineeRepository(ApplicationDbContext dbContext) : base(dbContext) { }


        public async Task<TraineeProfileRequestAndResponse> GetTraineeResponseAsync(string TraineeId)
        {

            var response = await GetTraineeProfileResponseQuery(TraineeId).SingleOrDefaultAsync();
            if (response == null)
                throw new KeyNotFoundException("Trainee is not found");
            return response;

        }





        public IQueryable<TraineeProfileRequestAndResponse> GetTraineeProfileResponseQuery(string id)
        {
            var response = Db.Trainees
                .IgnoreQueryFilters()
                .Where(x => x.Id.Equals(id))
                .Select(x =>
                     new TraineeProfileRequestAndResponse()
                     {
                         ImageUrl = x.ImageUrl,
                         Name = x.Name,
                         Phone = x.User.PhoneNumber,
                         PortfolioLink = x.PortfolioLink,
                         ResumeUrl = x.ResumeUrl,
                         Skills = x.Skills,
                         GithubInstallationId = x.GithubInstallationId,
                     }
                 );
            return response;
        }

        public async Task<TraineeOverveiwDashboardResponse> GetDashboardOverveiwAsync(string traineeId)
        {
            var trainee = await Db.Trainees
                .IgnoreQueryFilters()
                .Include(t => t.TrainingSession)
                    .ThenInclude(ts => ts.Trainer)
                .FirstOrDefaultAsync(t => t.Id == traineeId);

            if (trainee == null) return null;

            return new TraineeOverveiwDashboardResponse
            {
                TrainerName = trainee.TrainingSession?.Trainer?.Name,
                TrainerGitHubAccount = trainee.TrainingSession?.Trainer?.GithubUsername,
                TrainingSessionTitle = trainee.TrainingSession?.Name,
                startDate = trainee.TrainingSession?.StartDate ?? DateTime.MinValue,
                EndDate = trainee.TrainingSession?.EndDate ?? DateTime.MinValue,
                traineeTaskAssigenmentDtos = await GetTraineeTaskAssigenmentQuery(traineeId).ToListAsync(),
                traineeAnnouncementDtos = await GetTraineeAnnouncementQuery(trainee.TrainingSessionId).ToListAsync()
            };
        }

        public IQueryable<TraineeTaskAssigenmentDto> GetTraineeTaskAssigenmentQuery(string traineeId)
        {
            return Db.TaskAssignments
                .IgnoreQueryFilters()
                .Where(ta => ta.TraineeId == traineeId)
                .Select(ta => new TraineeTaskAssigenmentDto
                {
                    TaskAssignmentId = ta.Id,
                    TaskTitle = ta.ApplicationTask.Title,
                    Status = Db.TaskSubmissions.Any(ts => ts.TaskAssignmentId == ta.Id) ? "Submitted" : (ta.Status ? "Completed" : "Pending"),
                    AssigedAtDate = ta.AssignedAt
                });
        }

        public IQueryable<TraineeAnnouncementDto> GetTraineeAnnouncementQuery(string trainingSessionId)
        {
            return Db.Announcements
                .IgnoreQueryFilters()
                .Where(a => a.TrainingSessionId == trainingSessionId)
                .Select(a => new TraineeAnnouncementDto
                {
                    AnnouncementId = a.Id,
                    Title = a.Title
                });
        }

        public async Task<TraineeTaskDetailesResponse?> GetTaskDetailesAsync(string taskAssignmentId, string traineeId)
        {
            return await GetTaskDetailesQuery(taskAssignmentId, traineeId).FirstOrDefaultAsync();
        }

        private IQueryable<TraineeTaskDetailesResponse> GetTaskDetailesQuery(string taskAssignmentId, string traineeId)
        {
            return Db.TaskAssignments
                .IgnoreQueryFilters()
                .Where(ta => ta.Id == taskAssignmentId && ta.TraineeId == traineeId)
                .Select(ta => new TraineeTaskDetailesResponse
                {
                    AssignedAt = ta.AssignedAt,
                    AttachmentUrl = ta.ApplicationTask.AttachmentUrl,
                    Deadline = ta.ApplicationTask.Deadline,
                    Description = ta.ApplicationTask.Description,
                    Notes = ta.ApplicationTask.Notes,
                    Title = ta.ApplicationTask.Title,
                    TrainingSessionId = ta.ApplicationTask.TrainingSessionId,
                    Status = ta.Status,
                    trainerName = ta.ApplicationTask.Trainer.Name
                });
        }

        public async Task<bool> SubmitTaskAsync(string traineeId, string taskAssignmentId, string repo, string branch, string? commitSha, string repoUrl)
        {
            var assignment = await Db.TaskAssignments
                .IgnoreQueryFilters()
                .Include(ta => ta.ApplicationTask)
                .SingleOrDefaultAsync(ta => ta.Id == taskAssignmentId && ta.TraineeId == traineeId);

            if (assignment == null) return false;

            var existing = await Db.TaskSubmissions
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(ts => ts.TaskAssignmentId == taskAssignmentId);

            if (existing != null)
            {
                existing.GithubRepo = repo;
                existing.GithubBranch = branch;
                existing.GithubCommitSha = commitSha ?? "";
                existing.GithubRepoUrl = repoUrl;
                existing.SubmittedAt = DateTime.Now;
                Db.TaskSubmissions.Update(existing);
            }
            else
            {
                var submission = new TaskSubmission
                {
                    Id = Guid.NewGuid().ToString(),
                    TaskAssignmentId = taskAssignmentId,
                    GithubRepo = repo,
                    GithubBranch = branch,
                    GithubCommitSha = commitSha ?? "",
                    GithubRepoUrl = repoUrl,
                    SubmittedAt = DateTime.Now,
                    SubmittedBy = traineeId,
                    SubmittedTo = assignment.ApplicationTask.TrainerId,
                    TrainingSessionId = assignment.ApplicationTask.TrainingSessionId
                };
                Db.TaskSubmissions.Add(submission);
            }

            assignment.Status = true;
            Db.TaskAssignments.Update(assignment);

            return await Db.SaveChangesAsync() > 0;
        }

        public async Task<TaskSubmission?> GetSubmissionByAssignmentIdAsync(string traineeId, string taskAssignmentId)
        {
            return await Db.TaskSubmissions
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(ts => ts.TaskAssignmentId == taskAssignmentId && ts.SubmittedBy == traineeId);
        }

        public async Task<TaskAssigementsAndSubmissionsResponseModel?> GetTraineeTasksAndSubmissionsAsync(string traineeId)
        {
            var traineeExists = await Db.Trainees
                .IgnoreQueryFilters()
                .AnyAsync(t => t.Id == traineeId);

            if (!traineeExists) return null;

            var tasks = await Db.TaskAssignments
                .IgnoreQueryFilters()
                .Where(ta => ta.TraineeId == traineeId)
                .Select(ta => new TrainerTaskSubmissionsDto
                {
                    TaskAssignmentId = ta.Id,
                    TaskTitle = ta.ApplicationTask.Title,
                    Deadline = ta.ApplicationTask.Deadline,
                    Feedback = ta.Feedback,
                    Grade = ta.Grad,
                    Status = ta.Feedback != null ? "Evaluated"
                           : Db.TaskSubmissions.Any(ts => ts.TaskAssignmentId == ta.Id) ? "Submitted"
                           : "Pending",
                    SubmittedAt = Db.TaskSubmissions
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == traineeId)
                        .Select(ts => (DateTime?)ts.SubmittedAt)
                        .FirstOrDefault(),
                    GithubRepo = Db.TaskSubmissions
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == traineeId)
                        .Select(ts => ts.GithubRepo)
                        .FirstOrDefault(),
                    GithubBranch = Db.TaskSubmissions
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == traineeId)
                        .Select(ts => ts.GithubBranch)
                        .FirstOrDefault(),
                    GithubRepoUrl = Db.TaskSubmissions
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == traineeId)
                        .Select(ts => ts.GithubRepoUrl)
                        .FirstOrDefault(),
                })
                .ToListAsync();

            // Extract owner from GithubRepoUrl (e.g. "https://github.com/YanalAbdullah04/Repo" -> "YanalAbdullah04")
            foreach (var task in tasks)
            {
                if (!string.IsNullOrEmpty(task.GithubRepoUrl))
                {
                    var segments = task.GithubRepoUrl.TrimEnd('/').Split('/');
                    if (segments.Length >= 2)
                        task.GithubOwner = segments[segments.Length - 2];
                }
            }

            return new TaskAssigementsAndSubmissionsResponseModel
            {
                TrainerTaskSubmissionsDtos = tasks
            };
        }
    }
}
