using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class TaskAssignmentConfiguration : IEntityTypeConfiguration<TaskAssignment>
    {
        public void Configure(EntityTypeBuilder<TaskAssignment> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            builder.HasIndex(x => new { x.TraineeId, x.ApplicationTaskId }).IsUnique();

            builder.HasOne(c => c.ApplicationTask)
                .WithMany()
                .HasForeignKey(x => x.ApplicationTaskId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x=>x.Trainee)
                .WithMany()
                .HasForeignKey(x=>x.TraineeId)
                .OnDelete(DeleteBehavior.NoAction);
            builder.Property(x => x.Status).IsRequired();
        }
    }
}
