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





        public async Task<ApplicantResponseDetailes> GetApplicantResponseDetailesAsync(string traineeId, string trainingSessionId)
        {
            return await GetApplicantResponseDetailesQuery(traineeId, trainingSessionId).FirstOrDefaultAsync();
        }

        private IQueryable<ApplicantResponseDetailes> GetApplicantResponseDetailesQuery(string traineeId, string trainingSessionId)
        {


            var result = Db.Applicants.Where(a => a.TraineeId == traineeId && a.TrainingSessionId == trainingSessionId)
            .Select(a => new ApplicantResponseDetailes()
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
            var query = Db.Applicants.AsQueryable();

            if (!string.IsNullOrEmpty(searchstring))
                query = query.Where(x => x.Trainee.Name.Contains(searchstring) ||
                x.Trainee.User.Email.Contains(searchstring) ||
                x.TrainingSession.Name.Contains(searchstring)
                );
            if (status.HasValue)
                query = query.Where(x => x.Status.Equals(status));
            if (!string.IsNullOrEmpty(trackid))
                query = query.Where(x => x.TrainingSession.TrackId.Equals(trackid));

            var result = query.Select(a => new ApplicantResponse()
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




    }
}
