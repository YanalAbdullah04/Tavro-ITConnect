using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ITConnect.Models.Repositories
{
    public class CompanyRepository : GenericRepository<Company>, ICompanyRepository
    {
        public CompanyRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<List<CompanyResponse>> GetCompanyResponseAsync()
        {
            return await Db.Companies
                .IgnoreQueryFilters()
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CompanyResponse
                {
                    CompanyId = c.Id,
                    Name = c.Name,
                    Email = c.User.Email,
                    Description = c.Description ?? "",
                    Location = c.Address ?? "",
                    NumberOfTracks = Db.Tracks.IgnoreQueryFilters().Count(t => t.CompanyId == c.Id)
                })
                .ToListAsync();
        }

        public async Task<List<CompanyTrackResponse>> GetCompanyTracksAsync(string companyId)
        {
            return await Db.Tracks
                .IgnoreQueryFilters()
                .Where(t => t.CompanyId == companyId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new CompanyTrackResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description ?? "",
                    CompanyId = t.CompanyId
                })
                .ToListAsync();
        }

        public async Task<List<CompanyTraineeResponse>> GetCompanyTraineesAsync(string companyId, string? searchQuery)
        {
            var query = Db.Trainees
                .IgnoreQueryFilters()
                .Where(t => t.TrainingSession.CompanyId == companyId);

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                query = query.Where(t =>
                    t.Name.Contains(searchQuery) ||
                    t.TrainingSession.Name.Contains(searchQuery));
            }

            return await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new CompanyTraineeResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Email = t.User.Email,
                    TrainingSessionName = t.TrainingSession.Name
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteCompanyTraineeAsync(string companyId, string traineeId)
        {
            var trainee = await Db.Trainees
                .IgnoreQueryFilters()
                .Include(t => t.TrainingSession)
                .SingleOrDefaultAsync(t => t.Id == traineeId && t.TrainingSession.CompanyId == companyId);

            if (trainee == null) return false;

            // Remove task submissions for this trainee
            var submissions = await Db.TaskSubmissions
                .IgnoreQueryFilters()
                .Where(ts => ts.SubmittedBy == traineeId)
                .ToListAsync();
            Db.TaskSubmissions.RemoveRange(submissions);

            // Remove task assignments for this trainee
            var assignments = await Db.TaskAssignments
                .IgnoreQueryFilters()
                .Where(ta => ta.TraineeId == traineeId)
                .ToListAsync();
            Db.TaskAssignments.RemoveRange(assignments);

            // Remove applicant records for this trainee in this company
            var applicants = await Db.Applicants
                .IgnoreQueryFilters()
                .Where(a => a.TraineeId == traineeId && a.CompanyId == companyId)
                .ToListAsync();
            Db.Applicants.RemoveRange(applicants);

            // Unlink from company and training session
            trainee.TrainingSessionId = null;
            trainee.CompanyId = null;
            Db.Trainees.Update(trainee);

            return await Db.SaveChangesAsync() > 0;
        }
    }
}
