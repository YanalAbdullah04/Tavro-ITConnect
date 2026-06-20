using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class TrainerRepository : GenericRepository<Trainer>, ITrainerRepository
    {
        public TrainerRepository(ApplicationDbContext dbContext) : base(dbContext) { }

        public Task<PagedResults<TrainerResponse>> GetTrainerResponsePageAsync(string? searchstring, int currentpage, int pagesize)
        {
            var query = GetTrainerResponseQuery(searchstring);
            return PaginationExtensions.ToPagedResultAsync(query, currentpage, pagesize);

        }
        public async Task<TrainerProfileResponse?> GetTrainerResponseProfileAsync(string trainerid)
        {
            var profile= await GetProfileBaseQuery(trainerid).SingleOrDefaultAsync();
            if (profile == null)
                return null;
            profile.TrainingsList= await GetTrainingsQuery(trainerid).ToListAsync();

            profile.StudentsList=await GetStudentsQuery(trainerid).ToListAsync();
            return profile;
            


        }
        private IQueryable<TrainerResponse> GetTrainerResponseQuery(string searchstring)
        {
            var query = Db.Trainers.AsQueryable();
            if (!string.IsNullOrEmpty(searchstring))
                query = query.Where(x => x.Name.Contains(searchstring) ||
                x.User.Email.Contains(searchstring) ||
                (x.Specialization != null && x.Specialization.Contains(searchstring))
                );
            var result = query.OrderByDescending(t => t.CreatedAt).Select(t => new TrainerResponse()
            {
                Specialization = t.Specialization,
                Email = t.User.Email,
                phone = t.User.PhoneNumber,
                TrainerName = t.Name,
                UserId = t.Id,
                CountStudents = Db.Trainees.Where(x => x.TrainingSession.TrainerId.Equals(t.Id)).Count(),
                TrainingSessionsCount = Db.TrainingSessions.Where(x => x.TrainerId.Equals(t.Id)).Count()

            });

            return result;
        }

        private IQueryable<TrainingSummaryDto> GetTrainingsQuery(string trainerId)
        {
            return Db.TrainingSessions
                .IgnoreQueryFilters()
                .Where(ts => ts.TrainerId == trainerId)
                .OrderByDescending(ts => ts.CreatedAt)
                .Select(ts => new TrainingSummaryDto
                {
                    Title = ts.Name,
                    StartDate = ts.StartDate,
                    EndDate = ts.EndDate,
                    Location = ts.Location,
                    StudentCount = Db.Trainees.IgnoreQueryFilters().Count(tr => tr.TrainingSessionId == ts.Id)
                });
        }
        private IQueryable<TraineeUnderTrainerDto> GetStudentsQuery(string trainerId)
        {
            return Db.Trainees
                .IgnoreQueryFilters()
                .Where(t => t.TrainingSession.Trainer.Id == trainerId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TraineeUnderTrainerDto
                {
                    StudentName = t.Name,
                    TrainingTitle = t.TrainingSession.Name
                });
        }
        private IQueryable<TrainerProfileResponse> GetProfileBaseQuery(string trainerId)
        {
            return Db.Trainers
                .IgnoreQueryFilters()
                .Where(x => x.Id == trainerId)
                .Select(t => new TrainerProfileResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Email = t.User.Email,
                    Phone = t.User.PhoneNumber,
                    Specialty = t.Specialization,
                    GitHubAccount=t.GithubUsername,
                    TotalTrainingsCount = Db.TrainingSessions.IgnoreQueryFilters().Count(ts => ts.TrainerId == trainerId),
                    TotalStudentsCount = Db.Trainees.IgnoreQueryFilters().Count(tr => tr.TrainingSession.TrainerId == trainerId),
                    TotalTasksCount = Db.ApplicationTask.IgnoreQueryFilters().Count(at => at.TrainerId == trainerId)
                });
        }

        public async Task<TrainerDashboardOverviewResponse?> GetGetTrainerDashboardOverViewResponseAsync(string TrainerId)
        {
            return await GetTrainerDashboardQuery(TrainerId).SingleOrDefaultAsync();
        }

        private IQueryable<TrainerDashboardOverviewResponse> GetTrainerDashboardQuery(string TrainerId)
        {
            var query = Db.Trainers.Where(x => x.Id == TrainerId).Select(t => new TrainerDashboardOverviewResponse()
            {
                TotalTraningCount = Db.TrainingSessions.Count(ts => ts.TrainerId == TrainerId),
                AssigingStudentsCount = Db.Trainees.Count(tr => tr.TrainingSession.TrainerId == TrainerId),
                PendingEvaluationsCount = Db.TaskAssignments.Count(ta =>
                    ta.Trainee.TrainingSession.TrainerId == TrainerId &&
                    ta.Status &&
                    Db.TaskSubmissions.Any(ts => ts.TaskAssignmentId == ta.Id) &&
                    ta.Feedback == null &&
                    ta.Grad == null),
                TrainingDto = Db.TrainingSessions.Where(x => x.TrainerId == TrainerId).Select(tr => new TrainingDtoInTrainerOverview()
                {
                    Id = tr.Id,
                    Name = tr.Name,
                    TotalStudents = Db.Trainees.Count(x => x.TrainingSessionId == tr.Id),
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    TaskCount = Db.ApplicationTask.Count(t => t.TrainingSessionId == tr.Id)
                }).ToList(),
            });
            return query;
        }

        public Task<PagedResults<TrainingDtoInTrainerOverview>> GetTrainerSessionsPageAsync(string trainerId, string? searchstring, int currentpage, int pagesize)
        {
            var query = Db.TrainingSessions
                .IgnoreQueryFilters()
                .Where(ts => ts.TrainerId == trainerId);

            if (!string.IsNullOrWhiteSpace(searchstring))
            {
                var search = searchstring.Trim().ToLower();
                query = query.Where(ts =>
                    (ts.Name != null && ts.Name.ToLower().Contains(search)) ||
                    (ts.Location != null && ts.Location.ToLower().Contains(search)) ||
                    (ts.Track != null && ts.Track.Name != null && ts.Track.Name.ToLower().Contains(search)));
            }

            var result = query
                .OrderByDescending(ts => ts.CreatedAt)
                .Select(ts => new TrainingDtoInTrainerOverview
                {
                    Id = ts.Id,
                    Name = ts.Name,
                    TotalStudents = Db.Trainees.Count(t => t.TrainingSessionId == ts.Id),
                    StartDate = ts.StartDate,
                    EndDate = ts.EndDate,
                    TaskCount = Db.ApplicationTask.Count(t => t.TrainingSessionId == ts.Id)
                });

            return PaginationExtensions.ToPagedResultAsync(result, currentpage, pagesize);
        }

        public Task<PagedResults<StudentWithinTraining>> GetTrainerTraineesPageAsync(string trainerId, string? searchstring, string? trainingSessionId, int currentpage, int pagesize)
        {
            var query = Db.Trainees
                .IgnoreQueryFilters()
                .Where(t => t.TrainingSession.TrainerId == trainerId);

            if (!string.IsNullOrWhiteSpace(trainingSessionId))
                query = query.Where(t => t.TrainingSessionId == trainingSessionId);

            if (!string.IsNullOrWhiteSpace(searchstring))
            {
                var search = searchstring.Trim();
                query = query.Where(t =>
                    t.Name.Contains(search) ||
                    t.User.Email.Contains(search) ||
                    t.TrainingSession.Name.Contains(search));
            }

            var result = query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new StudentWithinTraining
                {
                    StudentId = t.Id,
                    StudentName = t.Name,
                    Email = t.User.Email,
                    TrainingId = t.TrainingSessionId,
                    TrainingTitle = t.TrainingSession.Name,
                    NumberOfTasks = Db.TaskAssignments.Count(ta => ta.TraineeId == t.Id && ta.ApplicationTask.TrainingSessionId == t.TrainingSessionId)
                });

            return PaginationExtensions.ToPagedResultAsync(result, currentpage, pagesize);
        }

        public async Task<PagedResults<TrainerTaskSubmissionsDto>> GetTaskDeliverablesPageAsync(
            string trainerId,
            string? searchstring,
            string? status,
            string? trainingSessionId,
            string? traineeId,
            int currentpage,
            int pagesize)
        {
            var query = GetTrainerTaskAssignmentsQuery(trainerId);

            if (!string.IsNullOrWhiteSpace(trainingSessionId))
                query = query.Where(ta => ta.Trainee.TrainingSessionId == trainingSessionId);

            if (!string.IsNullOrWhiteSpace(traineeId))
                query = query.Where(ta => ta.TraineeId == traineeId);

            if (!string.IsNullOrWhiteSpace(searchstring))
            {
                var search = searchstring.Trim();
                query = query.Where(ta =>
                    ta.ApplicationTask.Title.Contains(search) ||
                    ta.Trainee.Name.Contains(search) ||
                    ta.Trainee.User.Email.Contains(search) ||
                    ta.Trainee.TrainingSession.Name.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim().ToLower();
                query = normalizedStatus switch
                {
                    "pending" => query.Where(ta =>
                        !Db.TaskSubmissions.Any(ts => ts.TaskAssignmentId == ta.Id) &&
                        ta.Feedback == null &&
                        ta.Grad == null),
                    "submitted" => query.Where(ta =>
                        Db.TaskSubmissions.Any(ts => ts.TaskAssignmentId == ta.Id) &&
                        ta.Feedback == null &&
                        ta.Grad == null),
                    "evaluated" => query.Where(ta => ta.Feedback != null || ta.Grad != null),
                    _ => query
                };
            }

            var result = query
                .OrderByDescending(ta => Db.TaskSubmissions
                    .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == ta.TraineeId)
                    .Select(ts => (DateTime?)ts.SubmittedAt)
                    .FirstOrDefault() ?? ta.AssignedAt)
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
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == ta.TraineeId)
                        .Select(ts => (DateTime?)ts.SubmittedAt)
                        .FirstOrDefault(),
                    GithubRepo = Db.TaskSubmissions
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == ta.TraineeId)
                        .Select(ts => ts.GithubRepo)
                        .FirstOrDefault(),
                    GithubBranch = Db.TaskSubmissions
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == ta.TraineeId)
                        .Select(ts => ts.GithubBranch)
                        .FirstOrDefault(),
                    GithubRepoUrl = Db.TaskSubmissions
                        .Where(ts => ts.TaskAssignmentId == ta.Id && ts.SubmittedBy == ta.TraineeId)
                        .Select(ts => ts.GithubRepoUrl)
                        .FirstOrDefault()
                });

            var page = await PaginationExtensions.ToPagedResultAsync(result, currentpage, pagesize);
            ApplyGithubOwners(page.Items);
            return page;
        }

        public async Task<TaskEvaluationsResponse> GetTaskEvaluationsMetaAsync(string trainerId)
        {
            var assignments = GetTrainerTaskAssignmentsQuery(trainerId);

            var trainees = await Db.Trainees
                .IgnoreQueryFilters()
                .Where(t => t.TrainingSession.TrainerId == trainerId)
                .OrderBy(t => t.Name)
                .Select(t => new traineeDtoInEvaluationResponse
                {
                    TraineeId = t.Id,
                    TraineeName = t.Name
                })
                .ToListAsync();

            var trainings = await Db.TrainingSessions
                .Where(ts => ts.TrainerId == trainerId)
                .OrderBy(ts => ts.Name)
                .Select(ts => new TrainingDtInEvaluationResponseo
                {
                    TrainingSessionId = ts.Id,
                    TrainingSessionName = ts.Name
                })
                .ToListAsync();

            return new TaskEvaluationsResponse
            {
                Trainees = trainees,
                Trainings = trainings,
                PendingEvaluations = await assignments.CountAsync(ta =>
                    Db.TaskSubmissions.Any(ts => ts.TaskAssignmentId == ta.Id) &&
                    ta.Feedback == null &&
                    ta.Grad == null),
                Evaluated = await assignments.CountAsync(ta => ta.Feedback != null || ta.Grad != null)
            };
        }

        public Task<PagedResults<TrainerAnnouncementResponse>> GetAnnouncementsPageAsync(string trainerId, string? searchstring, string? trainingSessionId, int currentpage, int pagesize)
        {
            var query = Db.Announcements
                .IgnoreQueryFilters()
                .Where(a => a.TrainingSession.TrainerId == trainerId);

            if (!string.IsNullOrWhiteSpace(trainingSessionId))
                query = query.Where(a => a.TrainingSessionId == trainingSessionId);

            if (!string.IsNullOrWhiteSpace(searchstring))
            {
                var search = searchstring.Trim();
                query = query.Where(a =>
                    a.Title.Contains(search) ||
                    a.Message.Contains(search) ||
                    a.TrainingSession.Name.Contains(search));
            }

            var result = query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new TrainerAnnouncementResponse
                {
                    AnnouncementId = a.Id,
                    TrainingSessionId = a.TrainingSessionId,
                    TrainingSessionName = a.TrainingSession.Name,
                    Title = a.Title,
                    Message = a.Message,
                    CreatedAt = a.CreatedAt
                });

            return PaginationExtensions.ToPagedResultAsync(result, currentpage, pagesize);
        }

        public async Task<bool> CreateAnnouncementAsync(string trainerId, string trainingSessionId, string title, string message)
        {
            var sessionExists = await Db.TrainingSessions
                .IgnoreQueryFilters()
                .AnyAsync(ts => ts.Id == trainingSessionId && ts.TrainerId == trainerId);

            if (!sessionExists) return false;

            Db.Announcements.Add(new Announcement
            {
                Id = Guid.NewGuid().ToString(),
                TrainingSessionId = trainingSessionId,
                Title = title,
                Message = message,
                CreatedAt = DateTime.UtcNow
            });

            return await Db.SaveChangesAsync() > 0;
        }

        private IQueryable<TaskAssignment> GetTrainerTaskAssignmentsQuery(string trainerId)
        {
            return Db.TaskAssignments
                .IgnoreQueryFilters()
                .Where(ta => ta.Trainee.TrainingSession.TrainerId == trainerId);
        }

        private static void ApplyGithubOwners(IEnumerable<TrainerTaskSubmissionsDto>? tasks)
        {
            foreach (var task in tasks ?? [])
            {
                if (!string.IsNullOrEmpty(task.GithubRepoUrl))
                {
                    var segments = task.GithubRepoUrl.TrimEnd('/').Split('/');
                    if (segments.Length >= 2)
                        task.GithubOwner = segments[segments.Length - 2];
                }
            }
        }

        private static int? GetMonthNumber(string term)
        {
            return term switch
            {
                "jan" or "january" => 1,
                "feb" or "february" => 2,
                "mar" or "march" => 3,
                "apr" or "april" => 4,
                "may" => 5,
                "jun" or "june" => 6,
                "jul" or "july" => 7,
                "aug" or "august" => 8,
                "sep" or "sept" or "september" => 9,
                "oct" or "october" => 10,
                "nov" or "november" => 11,
                "dec" or "december" => 12,
                _ => null
            };
        }



        //private IQueryable<TrainerProfileResponse> GetTrainerProfileResponseQuery(string trainerid)
        //{
        //    var Query = Db.Trainers.Where(x => x.UserId.Equals(trainerid)).Select(t => new TrainerProfileResponse()
        //    {
        //        Email = t.User.Email,
        //        Id = t.UserId,
        //        Name = t.Name,
        //        Phone = t.User.PhoneNumber,
        //        Specialty = t.Specialization,
        //        TotalTrainingsCount = Db.TrainingSessions.Where(x => x.TrainerId.Equals(t.UserId)).Count(),
        //        TotalStudentsCount = Db.Trainees.Where(x => x.TrainingSession.TrainerId.Equals(t.UserId)).Count(),

        //        TotalTasksCount = Db.ApplicationTask.Where(x => x.TrainerId.Equals(trainerid)).Count(),
        //        StudentsList = Db.Trainees.Where(t => t.TrainingSession.Trainer.UserId.Equals(trainerid))
        //              .Select(t => new TraineeUnderTrainerDto()
        //              {
        //                  StudentName = t.Name,
        //                  TrainingTitle = t.TrainingSession.Name
        //              }),
        //        TrainingsList = Db.TrainingSessions.Where(x => x.TrainerId.Equals(trainerid)).Select(x => new TrainingSummaryDto()
        //        {
        //            EndDate = x.EndDate,
        //            Location = x.Location,
        //            StartDate = x.StartDate,
        //            StudentCount = Db.Trainees.Count(s => s.TrainingSessionId.Equals(x.Id)),
        //            Title = x.Name,
        //        })
        //    });
        //    return Query;

        //}
    }
}
