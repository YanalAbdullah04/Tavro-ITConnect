using ITConnect.Data;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ITConnect.Tests;

public class TrainerWorkspaceContractTests
{
    [Fact]
    public async Task DashboardCountsOnlySubmittedTasksAwaitingEvaluation()
    {
        await using var context = CreateTrainerContext("trainer-1");
        var data = SeedWorkspace(context);
        var task = CreateTask("task-1", data.OwnSession.Id, data.OwnTrainer.Id);

        context.AddRange(
            task,
            CreateAssignment("assignment-pending", task.Id, data.OwnTrainee.Id, false),
            CreateAssignment("assignment-review", task.Id, data.SecondOwnTrainee.Id, true),
            CreateAssignment("assignment-evaluated", task.Id, data.ThirdOwnTrainee.Id, true, feedback: "Good work"));
        await context.SaveChangesAsync();

        var dashboard = await new TrainerRepository(context).GetGetTrainerDashboardOverViewResponseAsync(data.OwnTrainer.Id);

        Assert.NotNull(dashboard);
        Assert.Equal(1, dashboard.PendingEvaluationsCount);
    }

    [Fact]
    public async Task TrainerCannotReadAnotherTrainersTraineeProfileOrTasks()
    {
        await using var context = CreateTrainerContext("trainer-1");
        var data = SeedWorkspace(context);
        var task = CreateTask("other-task", data.OtherSession.Id, data.OtherTrainer.Id);
        context.AddRange(task, CreateAssignment("other-assignment", task.Id, data.OtherTrainee.Id, true));
        await context.SaveChangesAsync();

        var repository = new TraineeRepository(context);
        var profile = await repository.GetTraineeProfileResponseQuery(data.OtherTrainee.Id).SingleOrDefaultAsync();
        var tasks = await repository.GetTraineeTasksAndSubmissionsAsync(data.OtherTrainee.Id);

        Assert.Null(profile);
        Assert.Null(tasks);
    }

    [Fact]
    public async Task TaskAssignmentCannotTargetAnotherSessionOrForeignSelectedTrainee()
    {
        await using var context = CreateTrainerContext("trainer-1");
        var data = SeedWorkspace(context);
        var repository = new TrainingSessionRepository(context);

        var otherSessionResult = await repository.CreateAndAssignTaskAsync(
            CreateTask("other-session-task", data.OtherSession.Id, data.OwnTrainer.Id),
            [data.OtherTrainee.Id],
            false);
        var foreignTraineeResult = await repository.CreateAndAssignTaskAsync(
            CreateTask("foreign-trainee-task", data.OwnSession.Id, data.OwnTrainer.Id),
            [data.OwnTrainee.Id, data.OtherTrainee.Id],
            false);

        Assert.False(otherSessionResult);
        Assert.False(foreignTraineeResult);
        Assert.Empty(context.ApplicationTask.IgnoreQueryFilters());
        Assert.Empty(context.TaskAssignments.IgnoreQueryFilters());
    }

    [Fact]
    public async Task TaskAssignmentAndMissionProjectionUseTrainerOwnedData()
    {
        await using var context = CreateTrainerContext("trainer-1");
        var data = SeedWorkspace(context);
        var task = CreateTask("owned-task", data.OwnSession.Id, data.OwnTrainer.Id);
        var repository = new TrainingSessionRepository(context);

        var result = await repository.CreateAndAssignTaskAsync(task, [data.OwnTrainee.Id], false);
        var assignment = await context.TaskAssignments.SingleAsync();
        assignment.Status = true;
        assignment.Grad = "A";
        await context.SaveChangesAsync();

        var missions = await new TraineeRepository(context).GetTraineeTasksAndSubmissionsAsync(data.OwnTrainee.Id);

        Assert.True(result);
        Assert.Equal("Evaluated", Assert.Single(missions!.TrainerTaskSubmissionsDtos).Status);
    }

    private static ApplicationDbContext CreateTrainerContext(string trainerId)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var userContext = new Mock<IUserContext>();
        userContext.Setup(context => context.IsTrainer).Returns(true);
        userContext.Setup(context => context.TrainerId).Returns(trainerId);
        return new ApplicationDbContext(options, userContext.Object);
    }

    private static WorkspaceData SeedWorkspace(ApplicationDbContext context)
    {
        var company = new Company { Id = "company-1", Name = "Company" };
        var track = new Track { Id = "track-1", CompanyId = company.Id, Name = "Track", Description = "Track" };
        var ownTrainer = new Trainer { Id = "trainer-1", CompanyId = company.Id, Name = "Own Trainer" };
        var otherTrainer = new Trainer { Id = "trainer-2", CompanyId = company.Id, Name = "Other Trainer" };
        var ownSession = CreateSession("session-1", company.Id, track.Id, ownTrainer.Id);
        var otherSession = CreateSession("session-2", company.Id, track.Id, otherTrainer.Id);
        var ownTrainee = CreateTrainee("trainee-1", company.Id, ownSession.Id, "Own Trainee");
        var secondOwnTrainee = CreateTrainee("trainee-2", company.Id, ownSession.Id, "Second Trainee");
        var thirdOwnTrainee = CreateTrainee("trainee-3", company.Id, ownSession.Id, "Third Trainee");
        var otherTrainee = CreateTrainee("trainee-4", company.Id, otherSession.Id, "Other Trainee");

        context.AddRange(
            company,
            track,
            ownTrainer,
            otherTrainer,
            ownSession,
            otherSession,
            ownTrainee.User,
            secondOwnTrainee.User,
            thirdOwnTrainee.User,
            otherTrainee.User,
            ownTrainee,
            secondOwnTrainee,
            thirdOwnTrainee,
            otherTrainee);
        context.SaveChanges();

        return new WorkspaceData(
            ownTrainer,
            otherTrainer,
            ownSession,
            otherSession,
            ownTrainee,
            secondOwnTrainee,
            thirdOwnTrainee,
            otherTrainee);
    }

    private static TrainingSession CreateSession(string id, string companyId, string trackId, string trainerId) => new()
    {
        Id = id,
        CompanyId = companyId,
        TrackId = trackId,
        TrainerId = trainerId,
        Name = id,
        Description = "Session",
        Location = "Remote",
        TrainingStatus = "Active",
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(30)
    };

    private static Trainee CreateTrainee(string id, string companyId, string sessionId, string name) => new()
    {
        Id = id,
        CompanyId = companyId,
        TrainingSessionId = sessionId,
        Name = name,
        User = new IdentityUser
        {
            Id = id,
            UserName = $"{id}@example.com",
            Email = $"{id}@example.com",
            PhoneNumber = "0790000000"
        }
    };

    private static ApplicationTask CreateTask(string id, string sessionId, string trainerId) => new()
    {
        Id = id,
        TrainingSessionId = sessionId,
        TrainerId = trainerId,
        Title = id,
        Description = "Task",
        Notes = "",
        Deadline = DateTime.UtcNow.AddDays(7)
    };

    private static TaskAssignment CreateAssignment(
        string id,
        string taskId,
        string traineeId,
        bool status,
        string? feedback = null) => new()
    {
        Id = id,
        ApplicationTaskId = taskId,
        TraineeId = traineeId,
        Status = status,
        Feedback = feedback
    };

    private sealed record WorkspaceData(
        Trainer OwnTrainer,
        Trainer OtherTrainer,
        TrainingSession OwnSession,
        TrainingSession OtherSession,
        Trainee OwnTrainee,
        Trainee SecondOwnTrainee,
        Trainee ThirdOwnTrainee,
        Trainee OtherTrainee);
}
