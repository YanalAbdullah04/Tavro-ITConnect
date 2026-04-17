using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories
{
    public interface IApplicantRepository :IGenericRepository<Applicant>
    {
        Task<ApplicantResponse> GetApplicantResponseAsync(Applicant Applicant);
        Task<ApplicantResponseDetailes> GetApplicantResponseDetailesAsync(string TraineeId, string TrainingSessionId);
        Task<List<ApplicantResponse>> GetApplicantResponseAsync();
        IQueryable<ApplicantResponse> GetApplicantResponseeQuery();
        IQueryable<ApplicantResponseDetailes> GetApplicantResponseDetailesQuery(string traineeId, string trainingSessionId);

    }
}
