using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ITConnect.Models.Repositories
{
    public interface ICompanyRepository : IGenericRepository<Company>
    {
        Task<List<CompanyResponse>> GetCompanyResponseAsync();
        Task<List<CompanyTrackResponse>> GetCompanyTracksAsync(string companyId);
    }
}
