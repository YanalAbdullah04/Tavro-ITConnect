using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class ApplicationTaskConfiguration : IEntityTypeConfiguration<ApplicationTask>
    {
        public void Configure(EntityTypeBuilder<ApplicationTask> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            builder.HasOne(x => x.Trainer)
                .WithMany()
                .HasForeignKey(x => x.TrainerId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.TrainingSession)
                .WithMany()
                .HasForeignKey(x => x.TrainingSessionId);

            builder.Property(x => x.Title).IsRequired();
            builder.Property(x => x.Deadline).IsRequired();
            builder.Property(x => x.Description).IsRequired();

        }
    }
}
