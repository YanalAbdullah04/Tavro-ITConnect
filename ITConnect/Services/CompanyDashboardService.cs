using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.DataResponsesModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Services
{
    public class CompanyDashboardService : ICompanyDashboardService
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserContext _userContext;
        private readonly UserManager<IdentityUser> _userManager;

        public CompanyDashboardService(ApplicationDbContext context, IUserContext userContext, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userContext = userContext;
            _userManager = userManager;

        }

        public async Task<CompanyDashboardSummaryResponse> GetSummaryAsync()
        {
            if (!_userContext.IsCompany || string.IsNullOrEmpty(_userContext.CompanyId))
                throw new UnauthorizedAccessException("Current user is not a company.");

            var companyId = _userContext.CompanyId;

            var totalStudents = await _context.Trainees
                .CountAsync(t => t.CompanyId == companyId);

            var activeTrainings = await _context.TrainingSessions
                .CountAsync(t => t.CompanyId == companyId && t.TrainingStatus == "Active");

            var openPosts = await _context.Posts
                .CountAsync(p => p.CompanyId == companyId && p.Status == "Open");

            var pendingApplicants = await _context.Applicants
                .CountAsync(a => a.CompanyId == companyId && a.Status == "Pending");

            return new CompanyDashboardSummaryResponse
            {
                TotalStudents = totalStudents,
                ActiveTrainings = activeTrainings,
                OpenPosts = openPosts,
                PendingApplicants = pendingApplicants
            };
        }

        public async Task<List<ApplicationResponse>> GetApplicationsAsync(int count = 5)
        {
            if (!_userContext.IsCompany || string.IsNullOrEmpty(_userContext.CompanyId))
                throw new UnauthorizedAccessException("Current user is not a company.");

            var companyId = _userContext.CompanyId;

            var applications = await _context.Applicants
                .Where(a => a.CompanyId == companyId)
                .Include(a => a.Trainee)
                .Include(a => a.TrainingSession)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .Select(a => new ApplicationResponse
                {
                    TraineeId = a.TraineeId,
                    TraineeName = a.Trainee != null ? a.Trainee.Name : "Unknown Trainee",
                    TrainingSessionId = a.TrainingSessionId,
                    TrainingSessionName = a.TrainingSession != null ? a.TrainingSession.Name : "Unknown Training",
                    Status = a.Status,
                    AppliedAt = a.CreatedAt
                })
                .ToListAsync();

            return applications;
        }

        public async Task<List<ActiveTrainingProgressResponse>> GetActiveTrainingProgressAsync(int count = 5)
        {
            if (!_userContext.IsCompany || string.IsNullOrEmpty(_userContext.CompanyId))
                throw new UnauthorizedAccessException("Current user is not a company.");

            var companyId = _userContext.CompanyId;
            var now = DateTime.UtcNow;

            var sessions = await _context.TrainingSessions
                .Where(t => t.CompanyId == companyId)
                .OrderByDescending(t => t.StartDate)
                .Take(count)
                .ToListAsync();

            var result = sessions.Select(t =>
            {
                int progress;

                if (now <= t.StartDate)
                {
                    progress = 0;
                }
                else if (now >= t.EndDate)
                {
                    progress = 100;
                }
                else
                {
                    var totalDuration = (t.EndDate - t.StartDate).TotalSeconds;
                    var elapsedDuration = (now - t.StartDate).TotalSeconds;

                    progress = totalDuration <= 0
                        ? 0
                        : (int)Math.Round((elapsedDuration / totalDuration) * 100);
                }

                return new ActiveTrainingProgressResponse
                {
                    TrainingSessionId = t.Id,
                    TrainingName = t.Name,
                    Status = t.TrainingStatus,
                    Location = t.Location,
                    SeatsNumber = t.SeatsNumber,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    ProgressPercentage = Math.Max(0, Math.Min(100, progress))
                };
            }).ToList();

            return result;
        }

        public async Task<List<RecentActivityResponse>> GetRecentActivityAsync(int count = 10)
        {
            if (!_userContext.IsCompany || string.IsNullOrEmpty(_userContext.CompanyId))
                throw new UnauthorizedAccessException("Current user is not a company.");

            var companyId = _userContext.CompanyId;

            var applicantActivities = await _context.Applicants
                .Where(a => a.CompanyId == companyId)
                .Include(a => a.Trainee)
                .Include(a => a.TrainingSession)
                .Select(a => new RecentActivityResponse
                {
                    Type = "Applicant",
                    Title = "New application received",
                    Description = (a.Trainee != null ? a.Trainee.Name : "Unknown Trainee") +
                                  " applied for " +
                                  (a.TrainingSession != null ? a.TrainingSession.Name : "Unknown Training"),
                    CreatedAt = a.CreatedAt,
                    Status = a.Status
                })
                .ToListAsync();

            var postActivities = await _context.Posts
                .Where(p => p.CompanyId == companyId)
                .Select(p => new RecentActivityResponse
                {
                    Type = "Post",
                    Title = "New post created",
                    Description = p.Title,
                    CreatedAt = p.Deadline,
                    Status = p.Status
                })
                .ToListAsync();

            var trainingActivities = await _context.TrainingSessions
                .Where(t => t.CompanyId == companyId)
                .Select(t => new RecentActivityResponse
                {
                    Type = "TrainingSession",
                    Title = "New training session created",
                    Description = t.Name,
                    CreatedAt = t.StartDate,
                    Status = t.TrainingStatus
                })
                .ToListAsync();

            var allActivities = applicantActivities
                .Concat(postActivities)
                .Concat(trainingActivities)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToList();

            return allActivities;
        }

        public async Task<List<ApplicationTrendResponse>> GetApplicationTrendAsync(int months = 6)
        {
            if (!_userContext.IsCompany || string.IsNullOrEmpty(_userContext.CompanyId))
                throw new UnauthorizedAccessException("Current user is not a company.");

            var companyId = _userContext.CompanyId;
            var now = DateTime.UtcNow;

            var startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-(months - 1));

            var applicants = await _context.Applicants
                .Where(a => a.CompanyId == companyId && a.CreatedAt >= startDate)
                .ToListAsync();

            var result = new List<ApplicationTrendResponse>();

            for (int i = 0; i < months; i++)
            {
                var currentMonth = startDate.AddMonths(i);
                var monthApplicants = applicants
                    .Where(a => a.CreatedAt.Year == currentMonth.Year &&
                                a.CreatedAt.Month == currentMonth.Month)
                    .ToList();

                result.Add(new ApplicationTrendResponse
                {
                    Month = currentMonth.ToString("MMM"),
                    ApplicationsCount = monthApplicants.Count,
                    AcceptedCount = monthApplicants.Count(a => a.Status == "Accepted")
                });
            }

            return result;
        }

        public async Task<UserCompositionResponse> GetUserCompositionAsync()
        {
            if (!_userContext.IsCompany || string.IsNullOrEmpty(_userContext.CompanyId))
                throw new UnauthorizedAccessException("Current user is not a company.");

            var companyId = _userContext.CompanyId;

            var studentsCount = await _context.Trainees
                .CountAsync(t => t.CompanyId == companyId);

            var trainersCount = await _context.Trainers
                .CountAsync(t => t.CompanyId == companyId);

            var allUsers = await _userManager.Users.ToListAsync();

            int adminsCount = 0;

            foreach (var user in allUsers)
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Contains("Admin"))
                {
                    adminsCount++;
                }
            }

            return new UserCompositionResponse
            {
                StudentsCount = studentsCount,
                TrainersCount = trainersCount,
                AdminsCount = adminsCount
            };
        }
        public async Task<List<BranchPerformanceResponse>> GetBranchPerformanceAsync(int count = 10)
        {
            if (!_userContext.IsCompany || string.IsNullOrEmpty(_userContext.CompanyId))
                throw new UnauthorizedAccessException("Current user is not a company.");

            var companyId = _userContext.CompanyId;

            var tracks = await _context.Tracks
                .Where(t => t.CompanyId == companyId)
                .OrderBy(t => t.Name)
                .Take(count)
                .ToListAsync();

            var result = new List<BranchPerformanceResponse>();

            foreach (var track in tracks)
            {
                var trainings = await _context.TrainingSessions
                    .Where(ts => ts.CompanyId == companyId && ts.TrackId == track.Id)
                    .ToListAsync();

                var numberOfTrainings = trainings.Count;

                var trainingIds = trainings.Select(ts => ts.Id).ToList();

                var numberOfStudents = await _context.Trainees
                    .CountAsync(tr => tr.CompanyId == companyId &&
                                      tr.TrainingSessionId != null &&
                                      trainingIds.Contains(tr.TrainingSessionId));

                var totalSeats = trainings.Sum(ts => ts.SeatsNumber);

                var completionRate = totalSeats > 0
                    ? (numberOfStudents * 100) / totalSeats
                    : 0;

                var health = completionRate >= 80
                    ? "Great"
                    : completionRate >= 60
                        ? "Stable"
                        : "Attention";

                result.Add(new BranchPerformanceResponse
                {
                    TrackId = track.Id,
                    TrackName = track.Name,
                    NumberOfStudents = numberOfStudents,
                    NumberOfTrainings = numberOfTrainings,
                    CompletionRate = completionRate,
                    Health = health
                });
            }

            return result;
        }
    }
}