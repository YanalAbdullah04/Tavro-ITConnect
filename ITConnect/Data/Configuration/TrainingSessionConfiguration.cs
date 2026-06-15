using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class TrainingSessionConfiguration : IEntityTypeConfiguration<TrainingSession>
    {
        public void Configure(EntityTypeBuilder<TrainingSession> builder)
        {
            builder.HasKey(t => t.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");

            builder.HasOne(x => x.Company)
                .WithMany()
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);


            builder.HasOne(x => x.Trainer)
                .WithMany()
                .HasForeignKey(x => x.TrainerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Track)
                .WithMany()
                .HasForeignKey(x => x.TrackId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.TrainingStatus)
                .HasConversion<string>();
        }
    }
}
