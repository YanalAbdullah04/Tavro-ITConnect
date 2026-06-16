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
                .Select(t => new CompanyTrackResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description ?? "",
                    CompanyId = t.CompanyId
                })
                .ToListAsync();
        }
    }
}
