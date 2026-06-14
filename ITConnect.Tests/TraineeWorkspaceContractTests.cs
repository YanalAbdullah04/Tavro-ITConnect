using ITConnect.Controllers;
using ITConnect.Data;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Models.Repository.cs;
using ITConnect.Services;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace ITConnect.Tests;

public class TraineeWorkspaceContractTests
{
    [Fact]
    public async Task DashboardWithoutSessionReturnsNullDatesAndEmptyCollections()
    {
        await using var context = CreateTraineeContext("trainee-1");
        context.AddRange(
            new IdentityUser { Id = "trainee-1", UserName = "trainee@example.com" },
            new Trainee { Id = "trainee-1", Name = "Trainee" });
        await context.SaveChangesAsync();

        var dashboard = await new TraineeRepository(context).GetDashboardOverveiwAsync("trainee-1");

        Assert.NotNull(dashboard);
        Assert.Null(dashboard.startDate);
        Assert.Null(dashboard.EndDate);
        Assert.Empty(dashboard.traineeTaskAssigenmentDtos);
        Assert.Empty(dashboard.traineeAnnouncementDtos);
    }

    [Fact]
    public async Task ProfileUpdatePersistsPhoneAndKeepsOptionalFieldsNullable()
    {
        var userContext = CreateUserContext("trainee-1");
        await using var context = CreateContext(userContext.Object);
        var user = new IdentityUser { Id = "trainee-1", UserName = "trainee@example.com", PhoneNumber = "old" };
        context.AddRange(user, new Trainee { Id = user.Id, Name = "Old name", User = user });
        await context.SaveChangesAsync();

        var service = new TraineeService(new TraineeRepository(context), userContext.Object);
        var updated = await service.UpdateTraineeProfileAsync(new TraineeProfileRequestAndResponse
        {
            Name = "New name",
            Phone = "0790000000",
            PortfolioLink = null,
            Skills = null,
            ResumeUrl = null,
            ImageUrl = null
        });

        Assert.True(updated);
        var profile = await new TraineeRepository(context).GetTraineeResponseAsync("trainee-1");
        Assert.Equal("New name", profile.Name);
        Assert.Equal("0790000000", profile.Phone);
        Assert.Null(profile.PortfolioLink);

        Assert.True(await service.UpdateTraineeProfileAsync(profile));
    }

    [Fact]
    public async Task GitHubDataEndpointsUseFilteredTraineeLookup()
    {
        var githubService = new Mock<IGitHubService>();
        var traineeRepository = new Mock<IGenericRepository<Trainee>>();
        traineeRepository.Setup(repository => repository.GetByIdAsync("other-trainee"))
            .ReturnsAsync((Trainee)null!);
        traineeRepository.Setup(repository => repository.GetByIdIgnoreFiltersAsync("other-trainee"))
            .ReturnsAsync(new Trainee { Id = "other-trainee", Name = "Other", GithubInstallationId = 123 });
        var controller = new GitHubController(
            githubService.Object,
            traineeRepository.Object,
            CreateUserContext("trainee-1").Object,
            new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["GitHubConfig:AppSlug"] = "example-app",
                ["Frontend:BaseUrl"] = "https://frontend.example"
            }).Build(),
            new EphemeralDataProtectionProvider());

        var result = await controller.GetRepositories("other-trainee");

        Assert.IsType<NotFoundObjectResult>(result);
        traineeRepository.Verify(repository => repository.GetByIdAsync("other-trainee"), Times.Once);
        traineeRepository.Verify(repository => repository.GetByIdIgnoreFiltersAsync(It.IsAny<string>()), Times.Never);
        githubService.Verify(service => service.GetRepositoriesAsync(It.IsAny<long>()), Times.Never);
    }

    private static ApplicationDbContext CreateTraineeContext(string traineeId) =>
        CreateContext(CreateUserContext(traineeId).Object);

    private static ApplicationDbContext CreateContext(IUserContext userContext)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options, userContext);
    }

    private static Mock<IUserContext> CreateUserContext(string traineeId)
    {
        var userContext = new Mock<IUserContext>();
        userContext.Setup(context => context.IsTrainee).Returns(true);
        userContext.Setup(context => context.TraineeId).Returns(traineeId);
        return userContext;
    }
}
