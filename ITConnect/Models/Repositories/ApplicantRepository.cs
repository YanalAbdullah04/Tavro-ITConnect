using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class ApplicantRepository : GenericRepository<Applicant>, IApplicantRepository
    {
        public ApplicantRepository(ApplicationDbContext db) : base(db)
        {
        }


        public async Task<PagedResults<ApplicantResponse>> GetApplicantResponsePageAsync(int currentpage,
            int pagesize,
            string? searchstring,
            ApplicantStatus? status,
            string? trackid)
        {
            var item = GetApplicantResponseQuery(searchstring, status, trackid);


            return await PaginationExtensions.ToPagedResultAsync(item, currentpage, pagesize);

        }





        public async Task<ApplicantResponseDetailes> GetApplicantResponseDetailesAsync(string applicantId, string traineeId, string trainingSessionId)
        {
            return await GetApplicantResponseDetailesQuery(applicantId, traineeId, trainingSessionId).FirstOrDefaultAsync();
        }

        private IQueryable<ApplicantResponseDetailes> GetApplicantResponseDetailesQuery(string applicantId, string traineeId, string trainingSessionId)
        {
            var isCompany = Db.UserContext.IsCompany;
            var companyId = Db.UserContext.CompanyId;

            var query = Db.Applicants.IgnoreQueryFilters().Where(a =>
                a.Id == applicantId &&
                a.TraineeId == traineeId &&
                a.TrainingSessionId == trainingSessionId);

            if (isCompany)
                query = query.Where(a => a.CompanyId == companyId);

            var result = query.Select(a => new ApplicantResponseDetailes()
            {

                Email = a.Trainee.User.Email,
                PhoneNumber = a.Trainee.User.PhoneNumber,
                PortfolioLink = a.Trainee.PortfolioLink,
                ResumeUrl = a.Trainee.ResumeUrl,
                Skills = a.Trainee.Skills,
                TraineeName = a.Trainee.Name,
                TrackName = a.TrainingSession.Track.Name,
                TrainingSessionTitle = a.TrainingSession.Name,
                TrainingSessionId = a.TrainingSessionId,
                applicationDate = a.CreatedAt,
                status = a.Status,



            });
            return result;

        }

        private IQueryable<ApplicantResponse> GetApplicantResponseQuery(string searchstring, ApplicantStatus? status, string? trackid)
        {
            var isCompany = Db.UserContext.IsCompany;
            var companyId = Db.UserContext.CompanyId;

            var query = Db.Applicants.IgnoreQueryFilters().AsQueryable();

            if (isCompany)
                query = query.Where(a => a.CompanyId == companyId);

            if (!string.IsNullOrEmpty(searchstring))
                query = query.Where(x => x.Trainee.Name.Contains(searchstring) ||
                x.Trainee.User.Email.Contains(searchstring) ||
                x.TrainingSession.Name.Contains(searchstring)
                );
            if (status.HasValue)
                query = query.Where(x => x.Status.Equals(status));
            if (!string.IsNullOrEmpty(trackid))
                query = query.Where(x => x.TrainingSession.TrackId.Equals(trackid));

            var result = query.OrderByDescending(a => a.CreatedAt).Select(a => new ApplicantResponse()
            {
                TraineeEmail = a.Trainee.User.Email,
                ApplicantId = a.Id,
                TrackName = a.TrainingSession.Track.Name,
                CreatedAt = a.CreatedAt,
                Status = a.Status,
                TraineeId = a.TraineeId,
                TrainingSessionId = a.TrainingSessionId,
                TrackId = a.TrainingSession.TrackId,
                TraineeName = a.Trainee.Name,


            });
            return result;
        }




        public async Task<bool> HasAppliedAsync(string traineeId, string trainingSessionId)
        {
            return await Db.Applicants.IgnoreQueryFilters().AnyAsync(a => a.TraineeId == traineeId && a.TrainingSessionId == trainingSessionId);
        }

        public async Task<bool> CreateApplicationAsync(string postId, string traineeId)
        {
            var post = await Db.Posts.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null) return false;

            var hasApplied = await HasAppliedAsync(traineeId, post.TrainingSessionId);
            if (hasApplied) return false;

            var applicant = new Applicant
            {
                TraineeId = traineeId,
                CompanyId = post.CompanyId,
                TrainingSessionId = post.TrainingSessionId,
                Status = ApplicantStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await Db.Applicants.AddAsync(applicant);
            return await Db.SaveChangesAsync() > 0;
        }

        public async Task DeleteOtherApplicationsAsync(string traineeId, string currentApplicantId)
        {
            var otherApplicants = await Db.Applicants
                .IgnoreQueryFilters()
                .Where(a => a.TraineeId == traineeId && a.Id != currentApplicantId)
                .ToListAsync();

            Db.Applicants.RemoveRange(otherApplicants);
        }
    }
}
