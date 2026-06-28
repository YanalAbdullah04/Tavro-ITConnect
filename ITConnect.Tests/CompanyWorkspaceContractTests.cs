using System.Text.Json;
using ITConnect.Data;
using ITConnect.Data.RequestsModel.TrainingSessionDtos;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;
using ITConnect.Validators;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ITConnect.Tests;

public class CompanyWorkspaceContractTests
{
    private static ApplicationDbContext CreateCompanyContext(string companyId)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var userContext = new Mock<IUserContext>();
        userContext.Setup(context => context.IsCompany).Returns(true);
        userContext.Setup(context => context.CompanyId).Returns(companyId);
        return new ApplicationDbContext(options, userContext.Object);
    }

    [Fact]
    public void CompanyStatuses_SerializeAsStrings()
    {
        Assert.Equal("\"Accepted\"", JsonSerializer.Serialize(ApplicantStatus.Accepted));
        Assert.Equal("\"Published\"", JsonSerializer.Serialize(PostStatus.Published));
    }

    [Fact]
    public void TrainingSessionValidators_AllowUnpaidSessions()
    {
        var createRequest = new CreatTrainingSessionRequest
        {
            Name = "Frontend Foundations",
            Description = "Core frontend training",
            IsPaid = false,
            Location = "Remote",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            SeatsNumber = 20,
            TrackId = Guid.NewGuid().ToString(),
            TrainerId = Guid.NewGuid().ToString()
        };
        var updateRequest = new UpdateTrainingSessionRequest
        {
            Id = Guid.NewGuid().ToString(),
            Name = createRequest.Name,
            Description = createRequest.Description,
            IsPaid = false,
            TrainingStatus = TrainingStatus.Pending,
            Location = createRequest.Location,
            StartDate = createRequest.StartDate,
            EndDate = createRequest.EndDate,
            SeatsNumber = createRequest.SeatsNumber,
            TrackId = createRequest.TrackId,
            TrainerId = createRequest.TrainerId
        };

        Assert.True(new CreatTrainingSessionRequestValidator().Validate(createRequest).IsValid);
        Assert.True(new UpdateTrainingSessionRequestValidator().Validate(updateRequest).IsValid);
    }

    [Fact]
    public async Task CompanyListResponses_PreserveSessionAndPostEditFields()
    {
        const string companyId = "company-1";
        await using var context = CreateCompanyContext(companyId);
        var company = new Company { Id = companyId, Name = "Company" };
        var track = new Track { Id = "track-1", CompanyId = companyId, Name = "Frontend", Description = "Track" };
        var firstTrainer = new Trainer { Id = "trainer-1", CompanyId = companyId, Name = "First Mentor" };
        var secondTrainer = new Trainer { Id = "trainer-2", CompanyId = companyId, Name = "Second Mentor" };
        var firstSession = new TrainingSession
        {
            Id = "session-1",
            CompanyId = companyId,
            TrackId = track.Id,
            TrainerId = firstTrainer.Id,
            Name = "First Session",
            Description = "First",
            IsPaid = true,
            Location = "Remote",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            SeatsNumber = 10,
            TrainingStatus = TrainingStatus.Pending
        };
        var secondSession = new TrainingSession
        {
            Id = "session-2",
            CompanyId = companyId,
            TrackId = track.Id,
            TrainerId = secondTrainer.Id,
            Name = "Second Session",
            Description = "Second",
            IsPaid = false,
            Location = "On-site",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(60),
            SeatsNumber = 12,
            TrainingStatus = TrainingStatus.Pending
        };
        var post = new Post
        {
            Id = "post-1",
            CompanyId = companyId,
            TrainingSessionId = firstSession.Id,
            Title = "Frontend Internship",
            Description = "Opportunity",
            Deadline = DateTime.UtcNow.AddDays(14),
            ReqSkills = "TypeScript",
            Responsibility = "Build features",
            Benefits = "Mentorship",
            Status = PostStatus.Published
        };

        context.AddRange(company, track, firstTrainer, secondTrainer, firstSession, secondSession, post);
        await context.SaveChangesAsync();

        var sessions = await new TrainingSessionRepository(context).GetTrainingSessionResponseAsync();
        var posts = await new PostRepository(context).GetPostResponseAsync();

        Assert.Equal(2, sessions.Count);
        Assert.Equal("First Mentor", sessions.Single(session => session.Id == firstSession.Id).TrainerName);
        Assert.Equal("Second Mentor", sessions.Single(session => session.Id == secondSession.Id).TrainerName);
        Assert.True(sessions.Single(session => session.Id == firstSession.Id).IsPaid);
        Assert.Equal("Build features", Assert.Single(posts).Responsibility);
        Assert.Equal("Mentorship", Assert.Single(posts).Benefits);
    }
}
