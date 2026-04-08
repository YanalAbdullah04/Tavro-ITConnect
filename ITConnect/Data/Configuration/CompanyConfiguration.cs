using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class CompanyConfiguration : IEntityTypeConfiguration<Company>
    {
        public void Configure(EntityTypeBuilder<Company> builder)
        {
            builder.HasKey(c => c.UserId);
            builder.HasOne(u => u.User)
                .WithOne()
                .HasForeignKey<Company>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x=>x.Name).IsRequired();   
            



           
        }
    }
}
