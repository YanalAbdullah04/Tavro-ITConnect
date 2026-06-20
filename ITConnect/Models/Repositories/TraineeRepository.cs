
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
                         GithubUsername = x.GithubUsername,
                     }
                 );
            return response;
        }

        public async Task<bool> UpdateProfileAsync(Trainee trainee, string? phone)
        {
            var user = await Db.Users.SingleOrDefaultAsync(user => user.Id == trainee.Id);
            if (user == null) return false;

            user.PhoneNumber = phone;
            Db.Trainees.Update(trainee);
            await Db.SaveChangesAsync();
            return true;
        }

        public async Task<TraineeOverveiwDashboardResponse?> GetDashboardOverveiwAsync(string traineeId)
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
                startDate = trainee.TrainingSession?.StartDate,
                EndDate = trainee.TrainingSession?.EndDate,
                traineeTaskAssigenmentDtos = await GetTraineeTaskAssigenmentQuery(traineeId).ToListAsync(),
                traineeAnnouncementDtos = await GetTraineeAnnouncementQuery(trainee.TrainingSessionId).ToListAsync()
            };
        }

        public IQueryable<TraineeTaskAssigenmentDto> GetTraineeTaskAssigenmentQuery(string traineeId)
        {
            return Db.TaskAssignments
                .IgnoreQueryFilters()
                .Where(ta => ta.TraineeId == traineeId)
                .OrderByDescending(ta => ta.CreatedAt)
                .Select(ta => new TraineeTaskAssigenmentDto
                {
                    TaskAssignmentId = ta.Id,
                    TaskTitle = ta.ApplicationTask.Title,
                    Status = (ta.Feedback != null || ta.Grad != null) ? "Completed" : (Db.TaskSubmissions.Any(ts => ts.TaskAssignmentId == ta.Id) ? "Submitted" : "Pending"),
                    AssigedAtDate = ta.AssignedAt,
                    Feedback = ta.Feedback,
                    Grad = ta.Grad
                });
        }

        public IQueryable<TraineeAnnouncementDto> GetTraineeAnnouncementQuery(string? trainingSessionId)
        {
            return Db.Announcements
                .IgnoreQueryFilters()
                .Where(a => a.TrainingSessionId == trainingSessionId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new TraineeAnnouncementDto
                {
                    AnnouncementId = a.Id,
                    Title = a.Title,
                    Message = a.Message,
                    CreatedAt = a.CreatedAt
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
                .OrderByDescending(ta => ta.CreatedAt)
                .Select(ta => new TrainerTaskSubmissionsDto
                {
                    TaskAssignmentId = ta.Id,
                    TaskTitle = ta.ApplicationTask.Title,
                    TraineeId = ta.TraineeId,
                    TraineeName = ta.Trainee.Name,
                    TraineeEmail = ta.Trainee.User.Email,
                    TrainingSessionId = ta.Trainee.TrainingSessionId,
                    TrainingSessionName = ta.Trainee.TrainingSession.Name,
                    Deadline = ta.ApplicationTask.Deadline,
                    Feedback = ta.Feedback,
                    Grade = ta.Grad,
                    Status = ta.Feedback != null || ta.Grad != null ? "Evaluated"
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

        public async Task<bool> EvaluateTaskAsync(string trainerId, string taskAssignmentId, string? feedback, string? grade)
        {
            if (string.IsNullOrWhiteSpace(trainerId) || string.IsNullOrWhiteSpace(taskAssignmentId))
                return false;

            var assignment = await Db.TaskAssignments
                .IgnoreQueryFilters()
                .Include(ta => ta.Trainee)
                    .ThenInclude(t => t.TrainingSession)
                .SingleOrDefaultAsync(ta =>
                    ta.Id == taskAssignmentId &&
                    ta.Trainee.TrainingSession.TrainerId == trainerId);

            if (assignment == null) return false;

            var hasSubmission = await Db.TaskSubmissions
                .IgnoreQueryFilters()
                .AnyAsync(ts => ts.TaskAssignmentId == taskAssignmentId && ts.SubmittedBy == assignment.TraineeId);

            if (!hasSubmission) return false;

            assignment.Feedback = string.IsNullOrWhiteSpace(feedback) ? null : feedback.Trim();
            assignment.Grad = string.IsNullOrWhiteSpace(grade) ? null : grade.Trim();
            assignment.Status = true;

            Db.TaskAssignments.Update(assignment);
            await Db.SaveChangesAsync();
            return true;
        }
    }
}
