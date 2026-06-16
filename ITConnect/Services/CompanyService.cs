using ITConnect.Data.ResponsesModel;
using ITConnect.Iservices;
using ITConnect.Models.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ITConnect.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository companyRepository;

        public CompanyService(ICompanyRepository companyRepository)
        {
            this.companyRepository = companyRepository;
        }

        public async Task<List<CompanyResponse>> GetCompanyResponseAsync()
        {
            return await companyRepository.GetCompanyResponseAsync();
        }

        public async Task<List<CompanyTrackResponse>> GetCompanyTracksAsync(string companyId)
        {
            return await companyRepository.GetCompanyTracksAsync(companyId);
        }
    }
}
