using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class EvaluateTaskConfguration : IEntityTypeConfiguration<EvaluateTask>
    {
      
        public void Configure(EntityTypeBuilder<EvaluateTask> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            builder.HasOne(x => x.TaskAssignment)
                .WithMany()
                .HasForeignKey(x => x.TaskAssignmentId);
                

        }
    }
}
