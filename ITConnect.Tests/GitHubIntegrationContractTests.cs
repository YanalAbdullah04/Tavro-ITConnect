using ITConnect.Controllers;
using ITConnect.Data.ResponsesModel.GitHubResponseModels;
using ITConnect.Models;
using ITConnect.Models.Repository.cs;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace ITConnect.Tests;

public class GitHubIntegrationContractTests
{
    [Fact]
    public async Task ProtectedInstallStateConnectsOnlyTheIntendedTrainee()
    {
        var dependencies = CreateDependencies("trainee-1");
        var trainee = new Trainee { Id = "trainee-1", Name = "Trainee" };
        dependencies.Repository.Setup(repository => repository.GetByIdIgnoreFiltersAsync(trainee.Id)).ReturnsAsync(trainee);
        dependencies.Repository.Setup(repository => repository.UpdateIgnoreFiltersAsync(trainee.Id, trainee)).ReturnsAsync(true);
        dependencies.GitHubService.Setup(service => service.GetInstallationAsync(321)).ReturnsAsync(Installation(321));
        var controller = dependencies.CreateController();

        var installResult = Assert.IsType<OkObjectResult>((await controller.GetInstallUrl()).Result);
        var installUrl = Assert.IsType<GitHubInstallUrlResponse>(installResult.Value).InstallUrl;
        var state = GetQueryValue(installUrl, "state");
        Assert.DoesNotContain(trainee.Id, state);

        var callback = Assert.IsType<ContentResult>(await controller.Callback(321, state, null));

        Assert.Equal(200, callback.StatusCode);
        Assert.Contains("https://frontend.example", callback.Content);
        Assert.DoesNotContain("\"*\"", callback.Content);
        Assert.DoesNotContain("'*'", callback.Content);
        Assert.Equal(321, trainee.GithubInstallationId);
        dependencies.Repository.Verify(repository => repository.GetByIdIgnoreFiltersAsync(trainee.Id), Times.Once);
        dependencies.Repository.Verify(repository => repository.UpdateIgnoreFiltersAsync(trainee.Id, trainee), Times.Once);
    }

    [Fact]
    public async Task CallbackRejectsTamperedAndExpiredState()
    {
        var dependencies = CreateDependencies("trainee-1");
        var controller = dependencies.CreateController();
        var protector = dependencies.DataProtectionProvider.CreateProtector(GitHubController.InstallStatePurpose);
        var expiredState = protector.Protect("""{"TraineeId":"trainee-1","ExpiresAtUnixSeconds":0,"Nonce":"expired"}""");

        var tamperedResult = Assert.IsType<ContentResult>(await controller.Callback(321, "tampered", null));
        var expiredResult = Assert.IsType<ContentResult>(await controller.Callback(321, expiredState, null));

        Assert.Equal(400, tamperedResult.StatusCode);
        Assert.Equal(400, expiredResult.StatusCode);
        dependencies.Repository.Verify(repository => repository.GetByIdIgnoreFiltersAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task StatusReturnsDisconnectedWithoutInstallationAndDisconnectClearsInstallation()
    {
        var dependencies = CreateDependencies("trainee-1");
        var disconnected = new Trainee { Id = "trainee-1", Name = "Trainee" };
        dependencies.Repository.SetupSequence(repository => repository.GetByIdAsync(disconnected.Id))
            .ReturnsAsync(disconnected)
            .ReturnsAsync(new Trainee { Id = disconnected.Id, Name = "Trainee", GithubInstallationId = 321 });
        dependencies.Repository.Setup(repository => repository.UpdateAsync(disconnected.Id, It.IsAny<Trainee>())).ReturnsAsync(true);
        var controller = dependencies.CreateController();

        var statusResult = Assert.IsType<OkObjectResult>((await controller.GetStatus()).Result);
        var status = Assert.IsType<GitHubStatusResponse>(statusResult.Value);
        var disconnectResult = await controller.Disconnect();

        Assert.False(status.IsConnected);
        Assert.IsType<NoContentResult>(disconnectResult);
        dependencies.Repository.Verify(
            repository => repository.UpdateAsync(disconnected.Id, It.Is<Trainee>(trainee => trainee.GithubInstallationId == null)),
            Times.Once);
    }

    [Fact]
    public async Task GetFileContentClearsRemovedInstallation()
    {
        var dependencies = CreateDependencies(null, trainerId: "trainer-1");
        var trainee = new Trainee { Id = "trainee-1", Name = "Trainee", GithubInstallationId = 321 };
        dependencies.Repository.Setup(repository => repository.GetByIdAsync(trainee.Id)).ReturnsAsync(trainee);
        dependencies.Repository.Setup(repository => repository.UpdateAsync(trainee.Id, trainee)).ReturnsAsync(true);
        dependencies.GitHubService
            .Setup(service => service.GetFileContentAsync(321, "owner", "repo", "main", null))
            .ThrowsAsync(new HttpRequestException("Not Found", null, System.Net.HttpStatusCode.NotFound));
        var controller = dependencies.CreateController();

        var result = await controller.GetFileContent(trainee.Id, "owner", "repo", "main");

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        Assert.Contains("Repository not found or access denied", conflict.Value!.ToString()!);
        Assert.Null(trainee.GithubInstallationId);
        dependencies.Repository.Verify(repository => repository.UpdateAsync(trainee.Id, trainee), Times.Once);
    }

    [Fact]
    public async Task GetFileContentWorksWithBranchContainingSlash()
    {
        var dependencies = CreateDependencies(null, trainerId: "trainer-1");
        var trainee = new Trainee { Id = "trainee-1", Name = "Trainee", GithubInstallationId = 321 };
        dependencies.Repository.Setup(repository => repository.GetByIdAsync(trainee.Id)).ReturnsAsync(trainee);
        dependencies.GitHubService
            .Setup(service => service.GetFileContentAsync(321, "owner", "repo", "feature/Post-Resource", "src/App.tsx"))
            .ReturnsAsync("[]");
        var controller = dependencies.CreateController();

        var result = await controller.GetFileContent(trainee.Id, "owner", "repo", "feature/Post-Resource", "src/App.tsx");

        Assert.IsType<ContentResult>(result);
        dependencies.GitHubService.Verify(service => service.GetFileContentAsync(321, "owner", "repo", "feature/Post-Resource", "src/App.tsx"), Times.Once);
    }

    [Fact]
    public async Task TrainerCanReadOwnedTraineeContentButNotUnownedTraineeContent()
    {
        var dependencies = CreateDependencies(null, trainerId: "trainer-1");
        var owned = new Trainee { Id = "trainee-owned", Name = "Owned", GithubInstallationId = 321 };
        dependencies.Repository.Setup(repository => repository.GetByIdAsync(owned.Id)).ReturnsAsync(owned);
        dependencies.Repository.Setup(repository => repository.GetByIdAsync("trainee-unowned")).ReturnsAsync((Trainee)null!);
        dependencies.GitHubService
            .Setup(service => service.GetFileContentAsync(321, "owner", "repo", "main", null))
            .ReturnsAsync("[]");
        var controller = dependencies.CreateController();

        var ownedResult = await controller.GetFileContent(owned.Id, "owner", "repo", "main");
        var unownedResult = await controller.GetFileContent("trainee-unowned", "owner", "repo", "main");

        Assert.IsType<ContentResult>(ownedResult);
        Assert.IsType<NotFoundObjectResult>(unownedResult);
        dependencies.GitHubService.Verify(service => service.GetFileContentAsync(321, "owner", "repo", "main", null), Times.Once);
    }

    [Fact]
    public async Task TraineeCannotReadAnotherTraineesRepositories()
    {
        var dependencies = CreateDependencies("trainee-1");
        dependencies.Repository.Setup(repository => repository.GetByIdAsync("trainee-2")).ReturnsAsync((Trainee)null!);
        var controller = dependencies.CreateController();

        var result = await controller.GetRepositories("trainee-2");

        Assert.IsType<NotFoundObjectResult>(result);
        dependencies.GitHubService.Verify(
            service => service.GetRepositoriesAsync(It.IsAny<long>()),
            Times.Never);
    }

    [Fact]
    public async Task StatusClearsRemovedInstallation()
    {
        var dependencies = CreateDependencies("trainee-1");
        var trainee = new Trainee { Id = "trainee-1", Name = "Trainee", GithubInstallationId = 321 };
        dependencies.Repository.Setup(repository => repository.GetByIdAsync(trainee.Id)).ReturnsAsync(trainee);
        dependencies.Repository.Setup(repository => repository.UpdateAsync(trainee.Id, trainee)).ReturnsAsync(true);
        dependencies.GitHubService.Setup(service => service.GetInstallationAsync(321)).ReturnsAsync((GitHubInstallationMetadata?)null);
        var controller = dependencies.CreateController();

        var result = Assert.IsType<OkObjectResult>((await controller.GetStatus()).Result);
        var status = Assert.IsType<GitHubStatusResponse>(result.Value);

        Assert.False(status.IsConnected);
        Assert.True(status.IsStale);
        Assert.Null(trainee.GithubInstallationId);
    }

    [Fact]
    public async Task StatusReturnsVerifiedInstallationMetadata()
    {
        var dependencies = CreateDependencies("trainee-1");
        var trainee = new Trainee { Id = "trainee-1", Name = "Trainee", GithubInstallationId = 321 };
        dependencies.Repository.Setup(repository => repository.GetByIdAsync(trainee.Id)).ReturnsAsync(trainee);
        dependencies.GitHubService.Setup(service => service.GetInstallationAsync(321)).ReturnsAsync(Installation(321));
        var controller = dependencies.CreateController();

        var result = Assert.IsType<OkObjectResult>((await controller.GetStatus()).Result);
        var status = Assert.IsType<GitHubStatusResponse>(result.Value);

        Assert.True(status.IsConnected);
        Assert.Equal("verified-account", status.AccountLogin);
        Assert.Equal("selected", status.RepositorySelection);
    }

    private static Dependencies CreateDependencies(string? traineeId, string? trainerId = null)
    {
        var githubService = new Mock<IGitHubService>();
        var repository = new Mock<IGenericRepository<Trainee>>();
        var userContext = new Mock<IUserContext>();
        userContext.Setup(context => context.IsTrainee).Returns(traineeId != null);
        userContext.Setup(context => context.TraineeId).Returns(traineeId);
        userContext.Setup(context => context.IsTrainer).Returns(trainerId != null);
        userContext.Setup(context => context.TrainerId).Returns(trainerId);
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["GitHubConfig:AppSlug"] = "example-app",
            ["GitHubConfig:StateLifetimeMinutes"] = "10",
            ["Frontend:BaseUrl"] = "https://frontend.example"
        }).Build();

        return new Dependencies(githubService, repository, userContext, configuration, new EphemeralDataProtectionProvider());
    }

    private static GitHubInstallationMetadata Installation(long id) => new()
    {
        InstallationId = id,
        AccountLogin = "verified-account",
        AccountAvatarUrl = "https://avatars.example/account",
        AccountHtmlUrl = "https://github.com/verified-account",
        RepositorySelection = "selected"
    };

    private static string GetQueryValue(string url, string key)
    {
        var query = new Uri(url).Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries);
        var pair = query.Select(value => value.Split('=', 2)).Single(value => Uri.UnescapeDataString(value[0]) == key);
        return Uri.UnescapeDataString(pair[1]);
    }

    private sealed record Dependencies(
        Mock<IGitHubService> GitHubService,
        Mock<IGenericRepository<Trainee>> Repository,
        Mock<IUserContext> UserContext,
        IConfiguration Configuration,
        IDataProtectionProvider DataProtectionProvider)
    {
        public GitHubController CreateController() =>
            new(GitHubService.Object, Repository.Object, UserContext.Object, Configuration, DataProtectionProvider);
    }
}
