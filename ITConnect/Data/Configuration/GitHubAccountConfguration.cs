using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class GitHubAccountConfguration : IEntityTypeConfiguration<GithubAccount>
    {
        public void Configure(EntityTypeBuilder<GithubAccount> builder)
        {
            
            
        }
    }
}
