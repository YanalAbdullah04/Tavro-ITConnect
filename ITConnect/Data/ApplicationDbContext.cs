using ITConnect.Models;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Tls;

namespace ITConnect.Data;

public class ApplicationDbContext : IdentityDbContext
{
    public IUserContext UserContext { get; }

    public ApplicationDbContext(DbContextOptions options, IUserContext userContext) : base(options)
    {
        this.UserContext = userContext;
        ChangeTracker.Tracked += OnEntityTracked;
    }

    private void OnEntityTracked(object sender, Microsoft.EntityFrameworkCore.ChangeTracking.EntityTrackedEventArgs e)
    {
        if (e.FromQuery && e.Entry.Entity is TrainingSession session)
        {
            var now = System.DateTime.Now;
            if (now >= session.EndDate)
            {
                session.TrainingStatus = TrainingStatus.Complete;
            }
            else if (now >= session.StartDate)
            {
                session.TrainingStatus = TrainingStatus.Active;
            }
            else
            {
                session.TrainingStatus = TrainingStatus.Pending;
            }
        }
        else if (e.FromQuery && e.Entry.Entity is Post post)
        {
            var now = System.DateTime.Now;
            if (now >= post.Deadline)
            {
                post.Status = PostStatus.Unpublished;
            }
        }
    }

    public DbSet<Company> Companies { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<Applicant> Applicants { get; set; }
    //public DbSet<EvaluateTask> EvaluateTasks { get; set; }
    public DbSet<GithubAccount> GithubAccounts { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<TaskAssignment> TaskAssignments { get; set; }
    public DbSet<Track> Tracks { get; set; }
    public DbSet<ApplicationTask> ApplicationTask { get; set; }
    public DbSet<TaskSubmission> TaskSubmissions { get; set; }
    public DbSet<Trainer> Trainers { get; set; }
    public DbSet<Trainee> Trainees { get; set; }
    public DbSet<TrainingSession> TrainingSessions { get; set; }



    protected override void OnModelCreating(ModelBuilder builder)
    {
        Console.WriteLine(UserContext.IsCompany);
        Console.WriteLine(UserContext.IsTrainee);
        Console.WriteLine(UserContext.RawId);
        Console.WriteLine(UserContext.CompanyId);
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        //for company 
        builder.Entity<Track>().HasQueryFilter(t =>
        (UserContext.IsCompany && t.CompanyId == UserContext.CompanyId));


        //company
        builder.Entity<Post>().HasQueryFilter(t =>
        (UserContext.IsCompany && t.CompanyId == UserContext.CompanyId));


        //company , maybe i will add the trainee if i added the tracing application feature
        builder.Entity<Applicant>().HasQueryFilter(t =>
        (UserContext.IsCompany && t.CompanyId == UserContext.CompanyId)

     );


        //company and trainer
        builder.Entity<TrainingSession>().HasQueryFilter(ts =>
           (UserContext.IsCompany && ts.CompanyId == UserContext.CompanyId) ||
           (UserContext.IsTrainer && ts.TrainerId == UserContext.TrainerId)
       );
       
    
        // company and tyrainer 
        builder.Entity<Trainer>().HasQueryFilter(tr =>
         (UserContext.IsCompany && tr.CompanyId == UserContext.CompanyId) ||
         (UserContext.IsTrainer && (tr.Id == UserContext.TrainerId))
     );


        builder.Entity<Trainee>().HasQueryFilter(tr =>
    (UserContext.IsCompany && tr.CompanyId == UserContext.CompanyId) ||
    (UserContext.IsCompany && Applicants.Any(ap => ap.CompanyId == UserContext.CompanyId && ap.TraineeId == tr.Id)) ||
    (UserContext.IsTrainer && tr.TrainingSession.TrainerId == UserContext.TrainerId) ||
    (UserContext.IsTrainee && tr.Id == UserContext.TraineeId)
);



        //trainer trainee
        builder.Entity<Announcement>().HasQueryFilter(an =>
            (UserContext.IsTrainer && an.TrainingSession.TrainerId == UserContext.TrainerId) ||
            (UserContext.IsTrainee && Trainees.Any(tr => tr.Id == UserContext.TraineeId && tr.TrainingSessionId == an.TrainingSessionId))
        );
      
        //trainer and trainee
        builder.Entity<ApplicationTask>().HasQueryFilter(ta =>
            (UserContext.IsTrainer && (ta.Trainer.Id == UserContext.TrainerId))
        );
        // trainer trainee
        builder.Entity<TaskAssignment>().HasQueryFilter(ta =>
         (UserContext.IsTrainer && (ta.Trainee.TrainingSession.TrainerId == UserContext.TrainerId)));

    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            var baseEntity = (BaseEntity)entityEntry.Entity;

            if (entityEntry.State == EntityState.Added)
            {
                baseEntity.CreatedAt = DateTime.UtcNow;
            }
            else if (entityEntry.State == EntityState.Modified)
            {
                entityEntry.Property("CreatedAt").IsModified = false;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}


