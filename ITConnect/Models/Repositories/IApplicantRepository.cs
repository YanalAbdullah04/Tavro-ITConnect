using ITConnect.Data.ResponsesModel;

namespace ITConnect.Models.Repository.cs;

public interface IApplicantRepository:IGenericRepository<Applicant>
{
    Task<PagedResults<ApplicantResponse>> GetApplicantResponsePageAsync(
        int currentpage,
        int pagesize,
        string? searchstring,
        ApplicantStatus? status,
        string? trackid
    );

    Task<ApplicantResponseDetailes> GetApplicantResponseDetailesAsync(
        string traineeId,
        string trainingSessionId
    );

}
