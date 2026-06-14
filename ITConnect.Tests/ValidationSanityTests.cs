using ITConnect.Data;
using ITConnect.Data.RequestsModel.AuthDTOs;
using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Data.RequestsModel.TrackDTOs;
using ITConnect.Data.RequestsModel.TraineeDtos;
using ITConnect.Data.RequestsModel.TrainerDto;
using ITConnect.Data.RequestsModel.TrainerResponse;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;
using ITConnect.Validators;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ITConnect.Tests;

public class ValidationSanityTests
{
    [Fact]
    public void AssignTask_AllowsOptionalFieldsAndFalseIncludeAllWithSelectedTrainees()
    {
        var request = ValidAssignTask();
        request.IncludeAll = false;
        request.TraineesId = ["trainee-1"];
        request.Notes = null;
        request.Attachment = null;

        Assert.True(new AssignTaskRequestValidator().Validate(request).IsValid);
    }

    [Fact]
    public void AssignTask_RequiresTraineesOnlyWhenIncludeAllIsFalse()
    {
        var validator = new AssignTaskRequestValidator();
        var selectedRequest = ValidAssignTask();
        selectedRequest.IncludeAll = false;
        selectedRequest.TraineesId = null;
        var allRequest = ValidAssignTask();
        allRequest.IncludeAll = true;
        allRequest.TraineesId = null;

        Assert.Contains(validator.Validate(selectedRequest).Errors, error => error.PropertyName == nameof(AssignTaskRequest.TraineesId));
        Assert.True(validator.Validate(allRequest).IsValid);
    }

    [Fact]
    public void PostValidators_AllowOptionalStatusAndBenefits()
    {
        var addRequest = new AddPostRequest
        {
            Title = "Frontend Internship",
            Description = "Build production features",
            Deadline = DateTime.UtcNow.AddDays(10),
            ReqSkills = "TypeScript",
            Responsibility = "Deliver features",
            Benefits = null,
            Status = null,
            TrainingSessionId = "session-1"
        };
        var updateRequest = new UpdatePostRequest
        {
            Id = "post-1",
            Title = addRequest.Title,
            Description = addRequest.Description,
            Deadline = addRequest.Deadline,
            ReqSkills = addRequest.ReqSkills,
            Responsibility = addRequest.Responsibility,
            Benefits = null,
            Status = null,
            TrainingSessionId = addRequest.TrainingSessionId
        };

        Assert.True(new AddPostRequestValidator().Validate(addRequest).IsValid);
        Assert.True(new UpdatePostRequestValidator().Validate(updateRequest).IsValid);
    }

    [Fact]
    public void OptionalTrainerAndGitHubFields_AreNotRequired()
    {
        var registration = new TrainerRegistrationRequest
        {
            FullName = "Mentor Name",
            Email = "mentor@example.com",
            Phone = "0790000000",
            Specialization = null
        };
        var profileSetting = new TrainerProfileSettingRequest
        {
            Password = "StrongPassword123!",
            GitHubAccount = null,
            ImgUrl = null
        };
        var management = new SettingTrainerProfileRequest
        {
            TrainerId = "trainer-1",
            Name = "Mentor Name",
            Email = "mentor@example.com",
            Phone = "0790000000",
            Specialization = null,
            GithubUsername = null,
            ImgUrl = null
        };

        Assert.True(new TrainerRegistrationRequestValidator().Validate(registration).IsValid);
        Assert.True(new TrainerProfileSettingRequestValidator().Validate(profileSetting).IsValid);
        Assert.True(new SettingTrainerProfileRequestValidator().Validate(management).IsValid);
    }

    [Fact]
    public async Task TrainerSearch_AllowsNullOptionalSpecialization()
    {
        const string companyId = "company-1";
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var userContext = new Mock<IUserContext>();
        userContext.Setup(context => context.IsCompany).Returns(true);
        userContext.Setup(context => context.CompanyId).Returns(companyId);

        await using var context = new ApplicationDbContext(options, userContext.Object);
        var trainerUser = new IdentityUser
        {
            Id = "trainer-1",
            Email = "mentor@example.com",
            UserName = "mentor@example.com",
            PhoneNumber = "0790000000"
        };
        var trainer = new Trainer
        {
            Id = trainerUser.Id,
            CompanyId = companyId,
            Name = "Mentor Name",
            Specialization = null,
            User = trainerUser
        };

        context.AddRange(trainerUser, trainer);
        await context.SaveChangesAsync();

        var result = await new TrainerRepository(context).GetTrainerResponsePageAsync("Mentor", 1, 10);
        var response = Assert.Single(result.Items!);

        Assert.Null(response.Specialization);
    }

    [Fact]
    public void TaskSubmission_AllowsMissingCommitShaButRequiresRepositoryMetadata()
    {
        var validator = new TaskSubmissionRequestValidator();
        var request = new TaskSubmissionRequest
        {
            TaskAssignmentId = "assignment-1",
            GithubRepo = "repo",
            GithubBranch = "main",
            GithubCommitSha = null,
            GithubRepoUrl = "https://github.com/example/repo"
        };

        Assert.True(validator.Validate(request).IsValid);

        request.GithubRepo = "";
        Assert.Contains(validator.Validate(request).Errors, error => error.PropertyName == nameof(TaskSubmissionRequest.GithubRepo));
    }

    [Fact]
    public void TrackAndRegistrationValidators_RejectMissingRequiredFields()
    {
        var trackResult = new AddTrackRequestValidator().Validate(new AddTrackRequest());
        var registrationResult = new RegisterationRequestValidator().Validate(new RegisterationRequest
        {
            Name = "Company",
            Email = "company@example.com",
            Phone = "0790000000",
            Password = ""
        });

        Assert.Contains(trackResult.Errors, error => error.PropertyName == nameof(AddTrackRequest.Name));
        Assert.Contains(trackResult.Errors, error => error.PropertyName == nameof(AddTrackRequest.Description));
        Assert.Contains(registrationResult.Errors, error => error.PropertyName == nameof(RegisterationRequest.Password));
    }

    private static AssignTaskRequest ValidAssignTask() => new()
    {
        TaskTitle = "Build a component",
        Description = "Implement the assigned component",
        Deadline = DateTime.UtcNow.AddDays(7),
        IncludeAll = true
    };
}
