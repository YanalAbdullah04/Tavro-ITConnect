using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Models.Repository.cs;
using System.Threading.Tasks;

namespace ITConnect.Models.Repositories
{
   public interface ITraineeRepository : IGenericRepository<Trainee>
    {
        Task<TraineeProfileRequestAndResponse> GetTraineeResponseAsync(string traineeid);
        Task<bool> UpdateProfileAsync(Trainee trainee, string? phone);
        Task<TraineeOverveiwDashboardResponse?> GetDashboardOverveiwAsync(string traineeId);
        IQueryable<TraineeTaskAssigenmentDto> GetTraineeTaskAssigenmentQuery(string traineeId);
        IQueryable<TraineeAnnouncementDto> GetTraineeAnnouncementQuery(string? trainingSessionId);
        Task<TraineeTaskDetailesResponse?> GetTaskDetailesAsync(string taskAssignmentId, string traineeId);
        Task<bool> SubmitTaskAsync(string traineeId, string taskAssignmentId, string repo, string branch, string? commitSha, string repoUrl);
        Task<TaskSubmission?> GetSubmissionByAssignmentIdAsync(string traineeId, string taskAssignmentId);
        Task<TaskAssigementsAndSubmissionsResponseModel?> GetTraineeTasksAndSubmissionsAsync(string traineeId);
    }
}
