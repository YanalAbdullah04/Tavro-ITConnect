using ITConnect.Data;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Services.Iservices;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace ITConnect.Tests
{
    public class GlobalFilterTests
    {
        private DbContextOptions<ApplicationDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        private async Task SeedData(ApplicationDbContext context)
        {
            var company = new Company { Id = "company1", Name = "Company 1" };
            context.Companies.Add(company);

            var track = new Track { Id = "track1", Name = "Track 1", Description = "Desc", CompanyId = "company1" };
            context.Tracks.Add(track);

            var trainer = new Trainer { Id = "trainer1", Name = "Trainer 1", CompanyId = "company1" };
            context.Trainers.Add(trainer);

            var trainingSession = new TrainingSession 
            { 
                Id = "session1", 
                Name = "Session 1", 
                Description = "Desc",
                Location = "Remote",
                TrainingStatus = "Active",
                TrackId = "track1",
                CompanyId = "company1",
                TrainerId = "trainer1",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1)
            };
            context.TrainingSessions.Add(trainingSession);

            var trainee1 = new Trainee { Id = "trainee1", Name = "Trainee 1", TrainingSessionId = "session1", CompanyId = "company1" };
            var trainee2 = new Trainee { Id = "trainee2", Name = "Trainee 2", TrainingSessionId = "session1", CompanyId = "company1" };
            context.Trainees.AddRange(trainee1, trainee2);

            var task = new ApplicationTask 
            { 
                Id = "task1", 
                Title = "Task 1", 
                Description = "Desc",
                Notes = "Notes",
                TrainingSessionId = "session1", 
                TrainerId = "trainer1" 
            };
            context.ApplicationTask.Add(task);

            var assignment1 = new TaskAssignment 
            { 
                Id = "assignment1", 
                TraineeId = "trainee1", 
                ApplicationTaskId = "task1",
                Status = false
            };
            var assignment2 = new TaskAssignment 
            { 
                Id = "assignment2", 
                TraineeId = "trainee2", 
                ApplicationTaskId = "task1",
                Status = false
            };
            context.TaskAssignments.AddRange(assignment1, assignment2);

            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetTaskDetailesAsync_Trainee1_CanOnlySeeTheirOwnAssignment()
        {
            // Arrange
            var options = CreateNewContextOptions();
            var mockUserContext = new Mock<IUserContext>();
            mockUserContext.Setup(u => u.IsTrainee).Returns(true);
            mockUserContext.Setup(u => u.TraineeId).Returns("trainee1");

            using (var context = new ApplicationDbContext(options, mockUserContext.Object))
            {
                await SeedData(context);
                var repository = new TraineeRepository(context);

                // Act
                var result1 = await repository.GetTaskDetailesAsync("assignment1", "trainee1");
                var result2 = await repository.GetTaskDetailesAsync("assignment2", "trainee1");

                // Assert
                Assert.NotNull(result1);
                Assert.Equal("Task 1", result1.Title);
                Assert.Null(result2); // Should be filtered out by manual check
            }
        }

        [Fact]
        public async Task GetTaskDetailesAsync_Trainee2_CanOnlySeeTheirOwnAssignment()
        {
            // Arrange
            var options = CreateNewContextOptions();
            var mockUserContext = new Mock<IUserContext>();
            mockUserContext.Setup(u => u.IsTrainee).Returns(true);
            mockUserContext.Setup(u => u.TraineeId).Returns("trainee2");

            using (var context = new ApplicationDbContext(options, mockUserContext.Object))
            {
                await SeedData(context);
                var repository = new TraineeRepository(context);

                // Act
                var result1 = await repository.GetTaskDetailesAsync("assignment1", "trainee2");
                var result2 = await repository.GetTaskDetailesAsync("assignment2", "trainee2");

                // Assert
                Assert.Null(result1); // Should be filtered out by manual check
                Assert.NotNull(result2);
                Assert.Equal("Task 1", result2.Title);
            }
        }

        [Fact]
        public async Task GetTaskDetailesAsync_Trainer_CanSeeAssignmentsOfTheirTrainees()
        {
            // Arrange
            var options = CreateNewContextOptions();
            var mockUserContext = new Mock<IUserContext>();
            mockUserContext.Setup(u => u.IsTrainer).Returns(true);
            mockUserContext.Setup(u => u.TrainerId).Returns("trainer1");

            using (var context = new ApplicationDbContext(options, mockUserContext.Object))
            {
                await SeedData(context);
                var repository = new TraineeRepository(context);

                // Act
                var result1 = await repository.GetTaskDetailesAsync("assignment1", "trainee1");
                var result2 = await repository.GetTaskDetailesAsync("assignment2", "trainee2");

                // Assert
                Assert.NotNull(result1);
                Assert.NotNull(result2);
            }
        }
    }
}
