using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class TaskSubmissionconfiguration : IEntityTypeConfiguration<TaskSubmission>
    {
        public void Configure(EntityTypeBuilder<TaskSubmission> builder)
        {

            builder.HasKey(ts => ts.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            builder.HasOne(ta => ta.TaskAssignment)
                .WithMany()
                .HasForeignKey(ts =>ts .TaskAssignmentId);

            builder.HasOne(x => x.Trainee)
                .WithMany()
                .HasForeignKey(x => x.SubmittedBy)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.Trainer)
                .WithMany()
                .HasForeignKey(x => x.SubmittedTo)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.TrainingSession)
           .WithMany()
           .HasForeignKey(x => x.TrainingSessionId)
           .OnDelete(DeleteBehavior.NoAction);

        }
    }
}
