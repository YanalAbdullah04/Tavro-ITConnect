using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models;
using System.Threading.Tasks;

namespace ITConnect.Services
{
    public interface ITraineeService
    {
        Task<TraineeProfileRequestAndResponse> GetTraineeProfileAsync(string? TraineeId);//for trainee and company access id is given by rout  if the user was company 
        Task<bool> UpdateTraineeProfileAsync(TraineeProfileRequestAndResponse traineeProfileRequestAndResponse);
        Task<TraineeOverveiwDashboardResponse> dashboardoverveiwasync();
        Task<TraineeTaskDetailesResponse?> GetTaskDetailesAsync(string taskAssignmentId, string? traineeId);
        Task<bool> SubmitTaskAsync(string taskAssignmentId, string repo, string branch, string commitSha, string repoUrl);
        Task<TaskSubmission?> GetSubmissionAsync(string taskAssignmentId);
    }
}
