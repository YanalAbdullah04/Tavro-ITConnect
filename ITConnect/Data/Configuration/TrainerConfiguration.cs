using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class TrainerConfiguration : IEntityTypeConfiguration<Trainer>
    {
        public void Configure(EntityTypeBuilder<Trainer> builder)
        {

            builder.HasKey(u=>u.Id);
            builder.HasOne(u => u.User)
                .WithOne()
                .HasForeignKey<Trainer>(u => u.Id)
                .OnDelete(DeleteBehavior.Cascade);
          
            builder.HasOne(c => c.Company)
                .WithMany()
                .HasForeignKey(t=>t.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Property(x => x.ImgUrl).IsRequired(false);
            builder.Property(x => x.GithubUsername).IsRequired(false);
            builder.Property(x=>x.Specialization).IsRequired(false);
           



        }
    }
}

