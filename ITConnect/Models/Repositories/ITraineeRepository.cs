using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories
{
   public interface ITraineeRepository : IGenericRepository<Trainee>
    {

        Task<TraineeProfileRequestAndResponse> GetTraineeResponseAsync(string traineeid);

    }
}