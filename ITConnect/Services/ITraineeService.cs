using ITConnect.Data.ResponsesModel.TraineeResponseModels;

namespace ITConnect.Services
{
    public interface ITraineeService
    {
        Task<TraineeProfileRequestAndResponse> GetTraineeProfileAsync(string? TraineeId);//for trainee and company access id is given by rout  if the user was company 
        Task<bool> UpdateTraineeProfileAsync(TraineeProfileRequestAndResponse traineeProfileRequestAndResponse);
        Task<TraineeOverveiwDashboardResponse> dashboardoverveiwasync();
        Task<TraineeTaskDetailesResponse?> GetTaskDetailesAsync(string taskAssignmentId, string? traineeId);
    }
}
