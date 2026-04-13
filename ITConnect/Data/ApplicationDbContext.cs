using ITConnect.Models;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Data;

public class ApplicationDbContext : IdentityDbContext
{
    private readonly IUserContext userContext;

    public ApplicationDbContext(DbContextOptions options, IUserContext userContext) : base(options)
    {
        this.userContext = userContext;
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
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        builder.Entity<Track>().HasQueryFilter(t =>
        (userContext.IsCompany && t.CompanyId == userContext.CompanyId));

        builder.Entity<TrainingSession>().HasQueryFilter(t =>
        (userContext.IsCompany && t.CompanyId == userContext.CompanyId));

        builder.Entity<Post>().HasQueryFilter(t =>
        (userContext.IsCompany && t.CompanyId == userContext.CompanyId));


    }



}


