using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class TraineeConfiguration : IEntityTypeConfiguration<Trainee>
    {
        public void Configure(EntityTypeBuilder<Trainee> builder)
        {

            builder.HasKey(x => x.Id);
            builder.HasOne(x => x.User)
                .WithOne()
                .HasForeignKey<Trainee>(t => t.Id)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Company)
                .WithMany()
                .HasForeignKey(t => t.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.TrainingSession)
                .WithMany()
                .HasForeignKey(t => t.TrainingSessionId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Property(x => x.GithubUsername)
                .IsRequired();
        }
    }

}
