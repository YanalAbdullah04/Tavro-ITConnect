using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ITConnect.Models;

namespace ITConnect.Data.Configuration
{
    public class ApplicatntConfiguration : IEntityTypeConfiguration<Applicant>
    {


        public void Configure(EntityTypeBuilder<Applicant> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            builder.HasIndex(a => new { a.TraineeId, a.TrainingSessionId }).IsUnique();


            builder.HasOne(x => x.TrainingSession)
                .WithMany()
                .HasForeignKey(a => a.TrainingSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Company)
                .WithMany()
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);
          

            builder.HasOne(x => x.Trainee)
                .WithMany()
                .HasForeignKey(x => x.TraineeId)
                .OnDelete(DeleteBehavior.NoAction);


            builder.Property(x => x.Status).IsRequired()
                .HasConversion(v => v.ToString(), v => ApplicantStatus.FromString(v));






        }
    }
}
