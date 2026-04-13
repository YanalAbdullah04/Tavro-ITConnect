using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class PostConfiguration : IEntityTypeConfiguration<Post>
    {
        public void Configure(EntityTypeBuilder<Post> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");

            builder.HasOne(x => x.TrainingSession)
                .WithMany()
                .HasForeignKey(x => x.TrainingSessionId)
                .OnDelete(DeleteBehavior.Cascade);


            builder.HasOne(x => x.Company)
                .WithMany()
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.NoAction);


            builder.Property(x => x.Responsibility).IsRequired();

            builder.Property(x => x.Title).IsRequired();
            builder.Property(x => x.Benefits).IsRequired();
            builder.Property(x => x.Deadline).IsRequired();
            builder.Property(x => x.Description).IsRequired();
            builder.Property(x => x.ReqSkills).IsRequired();
            builder.Property(x => x.Responsibility).IsRequired();

            builder.Property(p => p.Status).HasConversion(
           v => v.ToString(),                 // To DB
           v => PostStatus.FromString(v));    // From DB

        }
    }
}
