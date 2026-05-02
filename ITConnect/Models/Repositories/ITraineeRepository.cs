using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories
{
   public interface ITraineeRepository : IGenericRepository<Trainee>
    {

        Task<TraineeProfileRequestAndResponse> GetTraineeResponseAsync(string traineeid);
        Task<TraineeOverveiwDashboardResponse> GetDashboardOverveiwAsync(string traineeId);
        IQueryable<TraineeTaskAssigenmentDto> GetTraineeTaskAssigenmentQuery(string traineeId);
        IQueryable<TraineeAnnouncementDto> GetTraineeAnnouncementQuery(string trainingSessionId);
        Task<TraineeTaskDetailesResponse?> GetTaskDetailesAsync(string taskAssignmentId, string traineeId);
    }
}