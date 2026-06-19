using ITConnect.Data.ResponsesModel;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ITConnect.Iservices
{
    public interface ICompanyService
    {
        Task<List<CompanyResponse>> GetCompanyResponseAsync();
        Task<List<CompanyTrackResponse>> GetCompanyTracksAsync(string companyId);
        Task<List<CompanyTraineeResponse>> GetCompanyTraineesAsync(string? searchQuery);
        Task<bool> DeleteCompanyTraineeAsync(string traineeId);
    }
}
