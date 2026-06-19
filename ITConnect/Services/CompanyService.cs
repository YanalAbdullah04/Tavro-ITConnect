using ITConnect.Data.ResponsesModel;
using ITConnect.Iservices;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ITConnect.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository companyRepository;
        private readonly IUserContext userContext;

        public CompanyService(ICompanyRepository companyRepository, IUserContext userContext)
        {
            this.companyRepository = companyRepository;
            this.userContext = userContext;
        }

        public async Task<List<CompanyResponse>> GetCompanyResponseAsync()
        {
            return await companyRepository.GetCompanyResponseAsync();
        }

        public async Task<List<CompanyTrackResponse>> GetCompanyTracksAsync(string companyId)
        {
            return await companyRepository.GetCompanyTracksAsync(companyId);
        }

        public async Task<List<CompanyTraineeResponse>> GetCompanyTraineesAsync(string? searchQuery)
        {
            var companyId = userContext.CompanyId;
            if (string.IsNullOrEmpty(companyId))
                return new List<CompanyTraineeResponse>();

            return await companyRepository.GetCompanyTraineesAsync(companyId, searchQuery);
        }

        public async Task<bool> DeleteCompanyTraineeAsync(string traineeId)
        {
            var companyId = userContext.CompanyId;
            if (string.IsNullOrEmpty(companyId))
                return false;

            return await companyRepository.DeleteCompanyTraineeAsync(companyId, traineeId);
        }
    }
}
