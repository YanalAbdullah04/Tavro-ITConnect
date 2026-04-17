using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class ApplicantRepository : GenericRepository<Applicant>, IApplicantRepository
    {
        public ApplicantRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<ApplicantResponse> GetApplicantResponseAsync(Applicant Applicant)
        {  
            return await GetApplicantResponseeQuery().FirstOrDefaultAsync(x=>x.ApplicantId==Applicant.Id);
        }

        public async Task<List<ApplicantResponse>> GetApplicantResponseAsync()
        {
            return await GetApplicantResponseeQuery().ToListAsync();
        }

    

        public  async Task<ApplicantResponseDetailes> GetApplicantResponseDetailesAsync(string traineeId, string trainingSessionId)
        {
            return await GetApplicantResponseDetailesQuery(traineeId, trainingSessionId).FirstOrDefaultAsync();
        }

        public IQueryable<ApplicantResponseDetailes> GetApplicantResponseDetailesQuery(string traineeId,string trainingSessionId)
        {
            var result = Db.Applicants.Where(a => a.TraineeId==traineeId &&a.TrainingSessionId==trainingSessionId)
                .Select(a => new ApplicantResponseDetailes()
                {

                    Email=a.Trainee.User.Email,
                    PhoneNumber=a.Trainee.User.PhoneNumber,
                    PortfolioLink=a.Trainee.PortfolioLink,
                    ResumeUrl=a.Trainee.ResumeUrl,
                    Skills=a.Trainee.Skills,
                    TraineeName=a.Trainee.Name,
                    TrackName=a.TrainingSession.Track.Name,
                    TrainingSessionTitle=a.TrainingSession.Name,
                    TrainingSessionId = a.TrainingSessionId,
                    applicationDate=a.CreatedAt,
                    status=a.Status,
                    
                    
            
                });
            return result;
       
        }

        public IQueryable<ApplicantResponse> GetApplicantResponseeQuery()
        {
            var result = Db.Applicants.Select(a => new ApplicantResponse()
            { 
               ApplicantId=a.Id,
               TrackName=a.TrainingSession.Track.Name,
                CreatedAt = a.CreatedAt,
                Status = a.Status,
                TraineeId = a.TraineeId,
                TrainingSessionId = a.TrainingSessionId,
                TrackId = a.TrainingSession.TrackId,
                TraineeName= a.Trainee.Name,    
                
            });
            return result;
        }
    }
}
