

using ITConnect.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ITConnect.Data.Configuration
{
    public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> builder)
        {

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");

            builder.HasOne(x=>x.TrainingSession)
                .WithMany()
                .HasForeignKey(x => x.TrainingSessionId)

                .OnDelete(DeleteBehavior.Cascade);
            builder.Property(x => x.Message).IsRequired();
            builder.Property(x=>x.Title).IsRequired();
            
        }
    }
}
